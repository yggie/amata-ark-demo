import { AccountSetAsfFlags, Client, Wallet, convertStringToHex } from "xrpl";
import { File } from "nft.storage";
import createLogger from "pino";
import { readFile, readdir } from "fs/promises";
import { Dirent } from "fs";
import firebaseAdmin from "firebase-admin";
import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  getFirestore,
} from "firebase-admin/firestore";
import nftStorage from "../nftStorage";

import firebaseApp from "../firebaseApp";
import { COLLECTION_NAMES, OPERATIONAL_ACC } from "../constants";
import mime from "mime";
import path from "path";

const logger = createLogger();

const db = getFirestore(firebaseApp);

const clientUrl = "wss://s.altnet.rippletest.net:51233";
const client = new Client(clientUrl);

interface AssetDescriptor {
  path: string;
  description?: string;
  authorName?: string;
  authorBioUrl?: string;
  licenseUrl: string;
}

interface NFTMetadata {
  floorPrice: number;
  description: string;
  image: AssetDescriptor;
  model: AssetDescriptor;
}

interface CreatorMetadata {
  description?: string;
  image: AssetDescriptor;
}

let opWallet: Wallet = 0 as never;

async function main() {
  logger.info(`Connecting to ${clientUrl}...`);

  await client.connect();

  opWallet = Wallet.fromSeed(OPERATIONAL_ACC.seed);

  logger.info("Connection successful");

  await seedCreators(path.join(__dirname, "data"));
}

async function seedCreators(dirname: string) {
  const creatorEntries = await readdir(dirname, {
    withFileTypes: true,
  });

  for (const creatorDirEnt of creatorEntries) {
    if (creatorDirEnt.isDirectory()) {
      logger.info(`Found creator seed data for "${creatorDirEnt.name}"`);

      logger.info(`Checking profile for "${creatorDirEnt.name}"`);

      const creatorCollection = db.collection(
        COLLECTION_NAMES.CREATOR_PROFILES
      );

      const data = {
        name: creatorDirEnt.name,
        imageUrl: "https://picsum.photos/200",
      };

      const snapshot = await creatorCollection
        .where("name", "==", data.name)
        .get();

      let doc: QueryDocumentSnapshot<DocumentData> = 0 as never;
      if (snapshot.empty) {
        logger.warn(`No profile found - creating a new profile`);

        logger.warn("No wallet address provided - setting up a new wallet");

        const wallet = (
          await client.fundWallet(null, { faucetHost: undefined })
        ).wallet;

        logger.info("Wallet setup complete");

        logger.warn("Attempting to set the backend as an authorized minter");

        const tx = await client.submitAndWait(
          {
            TransactionType: "AccountSet",
            Account: wallet.address,
            NFTokenMinter: opWallet.address,
            SetFlag: AccountSetAsfFlags.asfAuthorizedNFTokenMinter,
          },
          {
            wallet,
          }
        );

        logger.warn("Authorization complete");

        await creatorCollection.doc().set({
          walletAddress: wallet.address,
          _walletCustodialData: {
            address: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            seed: wallet.seed,
          },
          ...data,
        });

        doc = (await creatorCollection.where("name", "==", data.name).get())
          .docs[0];

        logger.info("Profile successfully created");
      } else {
        logger.warn(
          "Profile found - reusing wallet but overriding profile details with seed data"
        );

        doc = snapshot.docs[0];
        const currentData = doc.data();
        doc.ref.set({
          walletAddress: currentData.walletAddress,
          _walletCustodialData: currentData._walletCustodialData,
          ...data,
        });

        logger.info("Profile updated");
      }

      await seedCollectiblesForCreator(
        path.join(dirname, creatorDirEnt.name),
        doc
      );
    }
  }
}

async function seedCollectiblesForCreator(
  dirname: string,
  creator: QueryDocumentSnapshot<DocumentData>
) {
  const collectiblesCollection = db.collection(COLLECTION_NAMES.COLLECTIBLES);
  const creatorData = creator.data();

  let characterDirEntries: Dirent[] = 0 as never;
  try {
    characterDirEntries = await readdir(path.join(dirname, "collectibles"), {
      withFileTypes: true,
    });
  } catch (e) {
    logger.error(e);
    logger.warn(
      `Failed to find collectibles folder, skipping "${creatorData.name}"`
    );
    return;
  }

  const creatorWallet = Wallet.fromSeed(creatorData._walletCustodialData.seed);

  for (const charDirEnt of characterDirEntries) {
    if (charDirEnt.isDirectory()) {
      const characterDir = path.join(dirname, "collectibles", charDirEnt.name);

      logger.info(
        `Found seed data for character NFT: "${charDirEnt.name}", for creator: "${creatorData.name}"`
      );

      logger.info(`Checking character profile for "${charDirEnt.name}"`);

      let metadata: NFTMetadata = 0 as never;
      try {
        metadata = JSON.parse(
          (await readFile(path.join(characterDir, "metadata.json"))).toString()
        );
      } catch (e) {
        logger.error(e);
        logger.warn(`Failed to find metadata, skipping "${charDirEnt.name}"`);
        continue;
      }

      const data = {
        name: charDirEnt.name,
        description: metadata.description,
        creatorId: creator.id,
        creatorAddress: creatorWallet.address,
        currentSalePrice: metadata.floorPrice,
      };

      const snapshot = await collectiblesCollection
        .where("name", "==", data.name)
        .get();

      let doc: QueryDocumentSnapshot<DocumentData> = 0 as never;
      if (snapshot.empty) {
        logger.warn(
          `No collectible found for "${data.name}" - creating new profile`
        );

        const nftDataUrl = await storeCharacterNFTOnIPFS(characterDir, {
          name: data.name,
          description: data.description,
          image: metadata.image,
          model: metadata.model,
          creatorAddress: creatorWallet.address,
        });

        const nftUri = convertStringToHex(nftDataUrl);

        logger.info("Creating NFT from IPFS link");
        await client.submitAndWait(
          {
            TransactionType: "NFTokenMint",
            Account: opWallet.address,
            Issuer: creatorWallet.address,
            URI: nftUri,
            Flags: 8,
            TransferFee: 10000,
            NFTokenTaxon: 0,
          },
          {
            wallet: opWallet,
          }
        );
        logger.info("NFT successfully created");

        const nfts = await client.request({
          command: "account_nfts",
          account: opWallet.classicAddress as string,
        });

        const matchingNFT = nfts.result.account_nfts.find(
          (nft) => nft.URI === nftUri
        );

        logger.info("Preparing initial sale with broker");
        await client.submitAndWait(
          {
            TransactionType: "NFTokenCreateOffer",
            Account: creatorWallet.address,
            NFTokenID: matchingNFT!.NFTokenID,
            Flags: 1,
            Amount: String(metadata.floorPrice * 1_000_000),
            Destination: opWallet.address,
          },
          {
            wallet: creatorWallet,
          }
        );
        logger.info("Sale offer successfully created");

        await collectiblesCollection.doc().set({
          nftDataUrl,
          tokenId: matchingNFT?.NFTokenID,
          ...data,
        });

        doc = (
          await collectiblesCollection.where("name", "==", data.name).get()
        ).docs[0];

        logger.info("New entry Character NFT created and recorded");
      } else {
        logger.warn(
          `Character NFT profile found for "${data.name}" - overwriting entry with seed data`
        );

        doc = snapshot.docs[0];
        doc.ref.set({
          nftDataUrl: doc.data().nftDataUrl,
          tokenId: doc.data().tokenId,
          ...data,
        });

        logger.info("Character NFT profile updated");
      }
    }
  }
}

async function storeCharacterNFTOnIPFS(
  dirname: string,
  data: {
    image: AssetDescriptor;
    model: AssetDescriptor;
    name: string;
    description?: string;
    creatorAddress: string;
  }
) {
  logger.info(`Uploading NFT to IPFS: "${data.name}"`);

  const imgPath = path.join(dirname, data.image.path);
  const content = await readFile(imgPath);
  const type = mime.getType(imgPath) || undefined;
  const file = new File([content], path.basename(imgPath), { type });

  const modelPath = path.join(dirname, data.model.path);
  const modelContents = await readFile(modelPath);
  const modelType = mime.getType(modelPath) || undefined;
  const modelFile = new File([modelContents], path.basename(modelPath), {
    type: modelType,
  });

  const { path: _path, ...imgRest } = data.image;
  const { path: _path2, ...modelRest } = data.model;

  return nftStorage
    .store({
      image: file,
      name: data.name,
      description: data.description || "",
      properties: {
        model: modelFile,
        imageMetadata: imgRest,
        creatorAddressXRPL: data.creatorAddress,
        modelMetadata: { ...modelRest },
      },
    })
    .then((resp: { url: string }) => {
      logger.info(`File upload success: ${resp.url}`);

      return resp.url;
    });
}

main().then(() => process.exit());

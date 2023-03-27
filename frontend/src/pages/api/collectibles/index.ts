import type { NextApiRequest, NextApiResponse } from "next";

import { ArkCollectible, ArkCreator, NFTMetadata } from "@src/types";
import { fetchIPFSJSON, ipfsToHttp } from "@src/utils/ipfs";
import { collections } from "@src/server-only/Firestore";

type Data = {
  data: ArkCollectible[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const snapshot = await collections.collectibles.get();

  const creatorsToResolve: Record<string, Promise<ArkCreator>> = {};

  const listOfPromises: Promise<ArkCollectible>[] = snapshot.docs.map(
    async (doc) => {
      const data = doc.data();

      const creatorPromise: Promise<ArkCreator> =
        creatorsToResolve[data.creatorId] ||
        collections.creators
          .doc(data.creatorId)
          .get()
          .then((doc) => {
            const data = doc.data()!;

            return {
              id: doc.id,
              name: data.name,
            };
          });
      creatorsToResolve[data.creatorId] = creatorPromise;

      const nftMetadataPromise = fetchIPFSJSON<NFTMetadata>(data.nftDataUrl);

      const creator = await creatorPromise;
      const nftMetadata = await nftMetadataPromise;

      return {
        id: doc.id,
        tokenId: data.tokenId,
        displayName: data.name,
        image: {
          url: ipfsToHttp(nftMetadata.image),
          ...nftMetadata.properties.imageMetadata,
        },
        creator,
        creatorId: data.creatorId,
        salePrice: data.currentSalePrice,
        profile: {
          type: "CHARACTER",
          name: data.name,
          model: {
            url: ipfsToHttp(nftMetadata.properties.model),
            ...nftMetadata.properties.modelMetadata,
          },
          description: nftMetadata.description,
        },
      };
    }
  );

  res.status(200).json({
    data: await Promise.all(listOfPromises),
  });
}

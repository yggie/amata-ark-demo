import { Client, Wallet } from "xrpl";
import createLogger from "pino";
import { readdir } from "fs/promises";
import { Dirent } from "fs";

const logger = createLogger();

async function main() {
  const clientUrl = "wss://s.altnet.rippletest.net:51233";
  const client = new Client(clientUrl);

  logger.info(`Connecting to ${clientUrl}...`);

  await client.connect();

  logger.info("Connection successful");

  const orgEntries = await readdir(`${__dirname}/data`, {
    withFileTypes: true,
  });

  for (const orgDirEnt of orgEntries) {
    if (orgDirEnt.isDirectory()) {
      await seedOrg(orgDirEnt);
    }
  }
}

async function seedOrg(orgDirEnt: Dirent) {
  logger.info(`Found org entry for "${orgDirEnt.name}"`);

  logger.info(`Checking profile for "${orgDirEnt.name}"`);

  const collectionEntries = await readdir(
    `${__dirname}/data/${orgDirEnt.name}`,
    {
      withFileTypes: true,
    }
  );

  for (const collectionDirEnt of collectionEntries) {
    if (collectionDirEnt.isDirectory()) {
      logger.info(
        `Found collection "${collectionDirEnt.name}" for "${orgDirEnt.name}"`
      );

      logger.info(`Checking state for "${collectionDirEnt.name}"`);

      const nftEntries = await readdir(
        `${__dirname}/data/${orgDirEnt.name}/${collectionDirEnt.name}`,
        {
          withFileTypes: true,
        }
      );

      for (const nftDirEnt of nftEntries) {
        logger.info(
          `Found NFT "${nftDirEnt.name}" for "${collectionDirEnt.name}"`
        );

        logger.info(`Checking state for "${nftDirEnt.name}"`);
      }
    }
  }
}

main().then(() => process.exit());

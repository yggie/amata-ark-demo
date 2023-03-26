import { ALL_NFTS } from "@src/dummydata";
import { ArkNFT } from "@src/types";
import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
  data: ArkNFT[];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const collectionId = req.query.collectionId;

  res.status(200).json({
    data: ALL_NFTS.filter((nft) => nft.collection.id === collectionId),
  });
}

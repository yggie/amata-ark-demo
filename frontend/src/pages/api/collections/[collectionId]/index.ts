import { ALL_COLLECTIONS } from "@src/dummydata";
import { ArkNFTCollection } from "@src/types";
import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
  data: ArkNFTCollection;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    data: ALL_COLLECTIONS.demo1,
  });
}

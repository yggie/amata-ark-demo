// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ALL_NFTS } from "@src/dummydata";
import { ArkNFT } from "@src/types";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data: ArkNFT[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    data: ALL_NFTS,
  });
}

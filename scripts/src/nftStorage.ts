import { NFTStorage } from "nft.storage";

export default new NFTStorage({
  token: process.env.NFT_STORAGE_API_KEY || "",
});

import { ArkNFT, ArkNFTCollection, ArkNFTCollectionOwner } from "./types";

export const ALL_OWNERS = {
  demo1: {
    id: "colowner123",
    name: "Great NFT owner",
    imageUrl: "https://picsum.photos/200",
  } as ArkNFTCollectionOwner,
};

export const ALL_COLLECTIONS = {
  demo1: {
    id: "col123",
    name: "NFT Collection 1",
    description: "",
    owner: ALL_OWNERS.demo1,
    imageUrl: "https://picsum.photos/200",
    backdrop: {
      type: "IMAGE",
      url: "https://picsum.photos/600/400",
    },
  } as ArkNFTCollection,
  demo2: {
    id: "col133",
    name: "NFT Collection 2",
    description: "",
    owner: ALL_OWNERS.demo1,
  },
};

export const ALL_NFTS: ArkNFT[] = [
  {
    uid: "col123-abc",
    profile: {
      type: "BIO",
      name: "NFT 1",
    },
    tokenId: "abc",
    imageUrl: "https://picsum.photos/400",
    explorerUrl: "https://amata.world",
    collection: ALL_COLLECTIONS.demo1,
    ownerUid: "owner123",
    modelPreviewUrl: "/assets/models/Koala.usdz",
  },
  {
    uid: "col133-abc",
    profile: {
      type: "BIO",
      name: "NFT 2",
    },
    tokenId: "abc",
    imageUrl: "https://picsum.photos/350",
    explorerUrl: "https://amata.world",
    collection: ALL_COLLECTIONS.demo2,
    ownerUid: "owner323",
    modelPreviewUrl: "/assets/models/Koala.usdz",
  },
];

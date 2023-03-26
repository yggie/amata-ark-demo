export interface ArkNFTCollectionOwner {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ArkNFTCollection {
  id: string;
  name: string;
  owner: ArkNFTCollectionOwner;
  description: string;
  imageUrl?: string;
  backdrop?:
    | {
        type: "IMAGE";
        url: string;
      }
    | {
        type: "SINGLE_COLOR";
        value: string;
      };
}

export interface ArkProfile {
  id: string;
  displayName: string;
}

export type ArkNFTProfile = {
  type: "BIO";
  name: string;
};

export interface ArkNFT {
  uid: string;
  profile: ArkNFTProfile;
  tokenId: string;
  imageUrl: string;
  ownerUid: string;
  explorerUrl: string;
  collection: ArkNFTCollection;
  ownerProfile?: ArkProfile;
  modelPreviewUrl?: string;
}

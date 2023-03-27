export interface ArkProfile {
  id: string;
  displayName: string;
}

export interface ArkCreator {
  id: string;
  name: string;
  imageUrl?: string;
}

export type ArkCollectibleProfile = {
  type: string;
  name: string;
  model: AssetDescriptor;
  description: string;
};

export interface AssetDescriptor {
  url: string;
  description: string;
  authorName: string;
  authorBioUrl: string;
  licenseUrl: string;
}

export interface ArkCollectible {
  id: string;
  tokenId: string;
  profile: ArkCollectibleProfile;
  creatorId: string;
  // ownerId: string;
  creator: ArkCreator;
  image: AssetDescriptor;
  displayName: string;
  ownerProfile?: ArkProfile;
  salePrice: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    model: string;
    imageMetadata: {
      description: string;
      authorName: string;
      authorBioUrl: string;
      licenseUrl: string;
    };
    modelMetadata: {
      description: string;
      authorName: string;
      authorBioUrl: string;
      licenseUrl: string;
    };
  };
}

// export interface ArkNFTCollection {
//   id: string;
//   name: string;
//   owner: ArkCreator;
//   description: string;
//   imageUrl?: string;
//   backdrop?:
//     | {
//         type: "IMAGE";
//         url: string;
//       }
//     | {
//         type: "SINGLE_COLOR";
//         value: string;
//       };
// }

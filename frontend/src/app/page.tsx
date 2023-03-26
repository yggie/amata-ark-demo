"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Inter } from "@next/font/google";

import { ArkNFT } from "@src/types";
import { defaultApiFetcher } from "@src/utils/fetchers";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const result = useSWR<ArkNFT[]>("/api/hello", defaultApiFetcher);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  console.log("RESULT", result);

  return (
    <div className="p-8 max-w-xl m-auto">
      <h2>Popular NFTs</h2>

      <ul>
        {!!result.data
          ? result.data.map((nft) => (
              <li key={nft.uid}>
                <div className="p-2 card card-side h-32 hover:bg-red-50">
                  <figure className="relative">
                    <img
                      src={nft.imageUrl}
                      alt={`Image for ${nft.profile.name}`}
                      className="w-40"
                    />

                    {nft.modelPreviewUrl ? (
                      <div className="absolute top-0 right-0">
                        <a rel="ar" href={nft.modelPreviewUrl}>
                          <span className="material-symbols-outlined">
                            view_in_ar
                          </span>
                        </a>
                      </div>
                    ) : null}
                  </figure>

                  <div className="card-body">
                    <h3 className="card-title link">
                      <Link
                        href={`/collections/${nft.collection.id}?tokenId=${nft.tokenId}`}
                      >
                        {nft.profile.name}
                      </Link>
                    </h3>
                    <p>
                      Collection:{" "}
                      <Link
                        href={`/collections/${nft.collection.id}`}
                        className="link link-primary"
                      >
                        {nft.collection.name}
                      </Link>
                      <br />
                      NFT??
                    </p>
                  </div>
                </div>
              </li>
            ))
          : null}
      </ul>

      <h2>Popular Collections</h2>
    </div>
  );
}

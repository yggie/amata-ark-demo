"use client";

import useSWR from "swr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Inter } from "@next/font/google";

import { ArkCollectible } from "@src/types";
import { defaultApiFetcher } from "@src/utils/fetchers";
import PlaceholderText from "@src/components/PlaceholderText";
import { PLACEHOLDER_IMAGE_URL } from "./constants";
import classNames from "classnames";

const inter = Inter({ subsets: ["latin"] });

export default function Home({
  searchParams,
}: {
  searchParams: { collectibleId?: string };
}) {
  const [mounted, setMounted] = useState(false);
  const result = useSWR<ArkCollectible[]>(
    "/api/collectibles",
    defaultApiFetcher
  );

  const [collectibleInFocus, setCollectibleInFocus] =
    useState<ArkCollectible>();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const collectibleInFocus = searchParams.collectibleId
      ? result.data?.find(
          (collectible) => collectible.id === searchParams.collectibleId
        )
      : undefined;

    if (collectibleInFocus) {
      setCollectibleInFocus(collectibleInFocus);
    }
  }, [result.data, searchParams.collectibleId]);

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-3xl m-auto">
      <p className="text-2xl">Collect, Trade, Make an Impact</p>

      <p className="mt-6">
        Collect interactive AR-powered NFTs all the while making a contribution
        to a good cause
      </p>

      <section className="mt-12 p-8 bg-white rounded-lg">
        <p className="text-2xl">We are changing the landscape of fundraising</p>

        <p className="mt-6">
          Just because it is for a good cause, it doesn&rsquo;t mean we have to
          drop our standards. NFTs can be used for fundraising, providing
          transparency to the entire process. By being digital first, we can
          also continually build utility into these NFTs while contributing to a
          good cause.
        </p>
      </section>

      <h2 className="text-xl mt-12">Featured Collectibles</h2>

      <ul className="flex flex-row gap-8 mt-4 flex-wrap">
        {!!result.data
          ? result.data.map((collectible) => (
              <li key={collectible.id}>
                <Link
                  href={`/?collectibleId=${collectible.id}`}
                  className="card h-72 w-52 bg-slate-50 shadow-md"
                >
                  <figure
                    className="flex-1 relative bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${collectible.image.url})`,
                    }}
                  >
                    <div className="absolute top-0 right-0"></div>
                  </figure>

                  <div className="card-body flex-none p-4">
                    <div className="text-xs text-slate-600 flex flex-row justify-end">
                      <div className="flex flex-row items-center gap-1">
                        <img
                          src="/assets/images/xrp_symbol.png"
                          alt=""
                          height="12"
                          width="12"
                        />
                        <span>{collectible.salePrice}</span>
                      </div>
                    </div>
                    <h3 className="card-title">{collectible.profile.name}</h3>
                  </div>
                </Link>
              </li>
            ))
          : null}
      </ul>

      <input
        type="checkbox"
        id="collectible-in-focus"
        className="modal-toggle"
        checked={!!searchParams.collectibleId}
        onChange={() => {}}
      />
      <div className="modal">
        <Link href="/" className="absolute inset-0"></Link>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <img
            src={collectibleInFocus?.image.url || PLACEHOLDER_IMAGE_URL}
            alt={`Image for ${collectibleInFocus?.displayName || "N/A"}`}
          />

          <div className="mt-2">
            <a
              rel="ar"
              href={collectibleInFocus?.profile.model.url}
              className={classNames("flex flex-row items-center gap-2", {
                "pointer-events-none opacity-50": ![
                  "iPhone",
                  "iPad",
                  "iPod",
                ].includes(
                  (window as any).navigator?.userAgentData?.platform ||
                    window.navigator.platform
                ),
              })}
            >
              <span className="material-symbols-outlined">view_in_ar</span>
              <span>View in AR (iOS only)</span>
            </a>
          </div>

          <div className="flex flex-row items-center justify-end gap-4">
            <a
              href={`https://testnet.xrpl.org/nft/${collectibleInFocus?.tokenId}`}
              target="_blank"
              rel="noreferrer nofollow"
              className="text-xs link flex flex-row items-center gap-1 text-slate-700"
            >
              <span>
                NFT:{(collectibleInFocus?.tokenId || "").slice(0, 8)}...
              </span>{" "}
              <span className="material-symbols-outlined !text-xs">
                open_in_new
              </span>
            </a>

            <div className="flex flex-row items-center gap-1">
              <img
                src="/assets/images/xrp_symbol.png"
                alt=""
                width="16"
                height="16"
              />
              <span>{collectibleInFocus?.salePrice}</span>
            </div>
          </div>

          <h1 className="text-xl">
            {collectibleInFocus ? (
              collectibleInFocus.profile.name
            ) : (
              <PlaceholderText />
            )}
          </h1>

          <p className="text-xs">by {collectibleInFocus?.creator.name}</p>

          <p className="mt-4">
            {collectibleInFocus?.profile.description || (
              <span className="opacity-50">Description not provided</span>
            )}
          </p>

          <div className="modal-action">
            <Link href="/" className="btn btn-outline">
              Dismiss
            </Link>

            <button className="btn btn-primary gap-2">Purchase</button>
          </div>
        </div>
      </div>
    </div>
  );
}

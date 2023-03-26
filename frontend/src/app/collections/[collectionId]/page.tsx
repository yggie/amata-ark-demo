"use client";

import useSWR from "swr";

import PlaceholderText from "@src/components/PlaceholderText";
import { ArkNFT, ArkNFTCollection } from "@src/types";
import { defaultApiFetcher } from "@src/utils/fetchers";
import { PLACEHOLDER_IMAGE_URL } from "@src/app/constants";
import classNames from "classnames";
import Link from "next/link";

export default function CollectionPage({
  params,
  searchParams,
}: {
  params: { collectionId: string };
  searchParams: { tokenId?: string };
}) {
  const collection = useSWR<ArkNFTCollection>(
    `/api/collections/${params.collectionId}`,
    defaultApiFetcher
  );

  const nfts = useSWR<ArkNFT[]>(
    `/api/collections/${params.collectionId}/nfts`,
    defaultApiFetcher
  );

  const nftInFocus = searchParams.tokenId
    ? nfts.data?.find((nft) => nft.tokenId === searchParams.tokenId)
    : undefined;

  console.log("CHECKING FOCUS", nftInFocus);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="card w-full rounded-none">
        <figure
          style={
            collection.data?.backdrop?.type === "SINGLE_COLOR"
              ? {
                  backgroundColor: collection.data.backdrop.value,
                }
              : undefined
          }
          className="relative h-[320px]"
        >
          <img
            src={
              collection.data?.backdrop?.type === "IMAGE"
                ? collection.data.backdrop.url
                : PLACEHOLDER_IMAGE_URL
            }
            alt={`Backdrop image for ${
              collection.data?.name || params.collectionId
            }`}
            className={classNames("w-full", {
              hidden: collection.data?.backdrop?.type !== "IMAGE",
            })}
          />

          <div className="w-32 h-32 overflow-hidden rounded-full absolute left-4 bottom-4 border-2 border-primary">
            <img
              src={collection.data?.imageUrl || PLACEHOLDER_IMAGE_URL}
              alt={`Image for ${collection.data?.name || params.collectionId}`}
            />
          </div>
        </figure>

        <div className="card-body">
          <h1 className="card-title">
            {collection.data ? collection.data.name : <PlaceholderText />}
          </h1>

          <p className="text-xs">
            {collection.data ? (
              <span>
                Managed by{" "}
                <Link
                  href={`/collection-owners/${collection.data.owner.id}`}
                  className="link link-primary"
                >
                  {collection.data.owner.name}
                </Link>
              </span>
            ) : (
              ""
            )}
          </p>

          <p className="mt-2">
            {collection.data?.description || (
              <span className="opacity-50">No description provided</span>
            )}
          </p>

          <div className="card-actions justify-end">
            <button className="btn btn-sm btn-outline">Follow</button>
          </div>
        </div>
      </div>

      <div className="bg-primary h-[1px] w-full mb-8"></div>

      <h2 className="text-lg">Browse NFTs</h2>

      <ul className="flex flex-row justify-start gap-4 mt-4 mb-8">
        {nfts.data ? (
          nfts.data.map((nft) => (
            <li key={nft.uid}>
              <Link
                href={`/collections/${nft.collection.id}?tokenId=${nft.tokenId}`}
                className="card w-56 bg-slate-50"
              >
                <figure className="h-52">
                  <img
                    src={nft.imageUrl}
                    alt={`Image for ${nft.profile.name}`}
                  />
                </figure>

                <div className="card-body">
                  <h3 className="card-title">{nft.profile.name}</h3>
                </div>
              </Link>
            </li>
          ))
        ) : (
          <li />
        )}
      </ul>

      <input
        type="checkbox"
        id="token-in-focus"
        className="modal-toggle"
        checked={!!nftInFocus}
      />
      <div className="modal">
        <Link
          href={`/collections/${nftInFocus?.collection.id}`}
          className="absolute inset-0"
        ></Link>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h1>{nftInFocus ? nftInFocus.profile.name : <PlaceholderText />}</h1>
        </div>
      </div>
    </div>
  );
}

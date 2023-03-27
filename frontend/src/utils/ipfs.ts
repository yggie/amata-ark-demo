import LRUCache from "lru-cache";

export function ipfsToHttp(url: string) {
  return url.replace("ipfs://", "https://ipfs.io/ipfs/");
}

function buildIPFSFetcher<T extends {}>(
  mapper: (resp: Response) => Promise<T>
) {
  const ipfsLookupCache = new LRUCache<string, T>({
    max: 50,
    maxSize: 300,
    sizeCalculation: (value, key) => 1,
    allowStale: true,
  });

  return function fetchIPFS(url: string): Promise<T> {
    const result = ipfsLookupCache.get(url);

    if (result) {
      return new Promise((r) => r(result));
    }

    return fetch(ipfsToHttp(url))
      .then(mapper)
      .then((value) => {
        ipfsLookupCache.set(url, value);

        return value;
      });
  };
}

export const fetchIPFSJSON: <T extends {}>(url: string) => T =
  buildIPFSFetcher<{}>((resp) => resp.json()) as any;

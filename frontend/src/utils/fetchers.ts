export function defaultApiFetcher(url: string) {
  return fetch(url)
    .then((res) => res.json())
    .then((json) => json.data);
}

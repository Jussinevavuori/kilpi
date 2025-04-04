import { getPagefind } from "@/components/pagefind/getPagefind";
import type { PagefindSearchResultData } from "@/components/pagefind/pagefindTypes";
import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

/**
 * With both leading and trailing slashes.
 */
export const OMITTED_PAGE_URLS = ["/", "/blog/"];

/**
 * Pagefind react bindings.
 */
export function usePagefind(query: string) {
  // Load pagefind
  const [pagefind, setPagefind] = useState<typeof window.pagefind | null>(null);
  useEffect(() => {
    getPagefind().then(setPagefind);
  }, []);

  // Debounced query for searching
  const debouncedQuery = useDebounce(query, 200);

  // Search results
  const [searchResults, setSearchResults] = useState<
    Array<PagefindSearchResultData & { id: string; score: number }>
  >([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Search for results on debounced query changes
  useEffect(() => {
    async function search() {
      if (!pagefind) return;
      if (!debouncedQuery.trim()) return;

      setIsLoading(true);

      // Search for results
      const { results } = await pagefind.search(debouncedQuery);

      // Process results
      setSearchResults(
        (
          await Promise.all(
            results.map(async (result) =>
              Object.assign(await result.data(), { id: result.id, score: result.score }),
            ),
          )
        ).filter((_) => !OMITTED_PAGE_URLS.includes(_.url)),
      );

      await new Promise((resolve) => setTimeout(resolve, 200));

      setIsLoading(false);
    }

    search();
  }, [setSearchResults, setIsLoading, pagefind, debouncedQuery]);

  return {
    isLoading,
    searchResults,
    debouncedQuery,
  };
}

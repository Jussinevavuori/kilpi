import { usePagefind } from "@/hooks/usePagefind";
import { useShortcut } from "@/hooks/useShortcut";
import { useCallback, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/Command";

export function PagefindSearch() {
  // Search dialog open state
  const [isOpen, setIsOpen] = useState(false);

  // On search or ⌘ K, open the search dialog
  const handleSearch = useCallback(() => setIsOpen(true), []);
  const shortcut = useShortcut("K", handleSearch);

  // Search using pagefind with query
  const [query, setQuery] = useState("");
  const pagefind = usePagefind(query);

  return (
    <>
      <button
        onClick={handleSearch}
        className="bg-muted text-muted-fg relative h-8 cursor-pointer rounded-lg border px-2 text-left text-sm sm:w-[240px]"
      >
        Search...
        <span className="bg-muted-bg text-muted-fg pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded px-1 text-xs font-semibold">
          {shortcut.label}
        </span>
      </button>

      <CommandDialog CommandProps={{ shouldFilter: false }} open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput
          isLoading={pagefind.isLoading}
          placeholder="Search docs..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {pagefind.searchResults.length === 0 ? (
            <CommandEmpty>No results found for {pagefind.debouncedQuery}</CommandEmpty>
          ) : (
            <CommandGroup
              heading={`${pagefind.searchResults.length} search results found for ${pagefind.debouncedQuery}`}
            >
              {pagefind.searchResults.map((result) => {
                return (
                  <CommandItem
                    key={result.url}
                    onSelect={() => {
                      window.location.pathname = result.url;
                    }}
                    value={result.url}
                    className="flex flex-col items-start gap-1"
                  >
                    <p className="text-muted-fg font-mono text-xs">{result.url}</p>
                    <p>{result.meta.title}</p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

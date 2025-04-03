import { usePagefind } from "@/hooks/usePagefind";
import { useShortcut } from "@/hooks/useShortcut";
import { CornerDownRightIcon } from "lucide-react";
import { Fragment, useCallback, useState } from "react";
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

  // Navigate function
  function navigate(url: string) {
    window.location.href = url;
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        onClick={handleSearch}
        className="bg-muted text-muted-fg relative h-8 flex-1 cursor-pointer rounded-lg border px-2 text-left text-sm md:max-w-[320px]"
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
        <CommandList className="[&_mark]:text-accent [&_mark]:bg-accent/10 [&_mark]:rounded [&_mark]:px-1 [&_mark]:font-semibold">
          {pagefind.searchResults.length === 0 ? (
            <CommandEmpty>
              {pagefind.debouncedQuery.trim() ? (
                <span>No results found for {pagefind.debouncedQuery}</span>
              ) : (
                <span>Type something to search the docs...</span>
              )}
            </CommandEmpty>
          ) : (
            <CommandGroup
              heading={`${pagefind.searchResults.length} search results found for ${pagefind.debouncedQuery}`}
            >
              {pagefind.searchResults.map((result, resultIndex) => {
                return (
                  <Fragment key={result.id}>
                    {resultIndex > 0 && <hr />}

                    <CommandItem
                      onSelect={() => navigate(result.url)}
                      value={result.url}
                      className="flex flex-col items-start gap-1 !py-2"
                    >
                      <p className="font-semibold">{result.meta.title}</p>
                      <p
                        className="text-muted-fg text-sm"
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    </CommandItem>

                    {result.sub_results
                      .filter((_) => _.url !== result.url)
                      .map((subResult) => {
                        return (
                          <CommandItem
                            key={subResult.url}
                            onSelect={() => navigate(subResult.url)}
                            value={subResult.url}
                            className="relative flex flex-col items-start gap-1 !pl-4"
                          >
                            <p className="flex items-center gap-2 font-medium">
                              <CornerDownRightIcon />
                              {subResult.title}
                            </p>
                            <p
                              className="text-muted-fg pl-7 text-sm"
                              dangerouslySetInnerHTML={{ __html: subResult.excerpt }}
                            />
                          </CommandItem>
                        );
                      })}
                  </Fragment>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export type PagefindSearchResultDataSubResult = {
  title: string;
  url: string;
  weighted_locations: Array<{
    weight: number;
    balanced_score: number;
    location: number;
  }>;
  locations: number[];
  excerpt: string;
};

export type PagefindSearchResultData = {
  url: string;
  content: string;
  word_count: number;
  filters: any;
  meta: {
    image: string;
    image_alt: string;
    title: string;
  };
  anchors: Array<{
    element: string;
    id: string;
    text: string;
    location: number;
  }>;
  weighted_locations: Array<{
    weight: number;
    balanced_score: number;
    location: number;
  }>;
  locations: number[];
  raw_content: string;
  raw_url: string;
  excerpt: string;
  sub_results: PagefindSearchResultDataSubResult[];
};

export type PagefindSearchResult = {
  id: string;
  score: number;
  words: string[];
  data: () => Promise<PagefindSearchResultData>;
};

export type PagefindSearchTiming = {
  preload?: number;
  search?: number;
  total?: number;
};

export type PagefindSearchReturn = {
  results: PagefindSearchResult[];
  filters?: any;
  totalFilters?: any;
  timings?: PagefindSearchTiming[];
  unfilteredResultsCount?: number;
};

export type PagefindSearchOptions = object;

export type Pagefind = {
  search(term: string, options?: PagefindSearchOptions): Promise<PagefindSearchReturn>;
};

declare global {
  interface Window {
    pagefind?: Pagefind;
  }
}

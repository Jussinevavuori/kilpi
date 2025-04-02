import type { Pagefind } from "./pagefindTypes";

// Get pagefind. Attempt to load it for 5 seconds before timint out, every 200ms.
export async function getPagefind(): Promise<Pagefind> {
  const abortSignal = AbortSignal.timeout(5_000);
  while (true) {
    if (window.pagefind) return window.pagefind;
    if (abortSignal.aborted) throw new Error("Pagefind timed out");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

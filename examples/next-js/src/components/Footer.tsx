import { ClearKilpiClientCacheButton } from "./ClearKilpiClientCacheButton";

export function Footer() {
  return (
    <footer className="bg-muted flex flex-col gap-8 p-8">
      <ClearKilpiClientCacheButton className="mt-4 font-semibold underline opacity-50" />
    </footer>
  );
}

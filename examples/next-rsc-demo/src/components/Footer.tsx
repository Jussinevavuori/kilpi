export function Footer() {
  return (
    <footer className="sticky top-0 z-50 bg-white border-t h-14">
      <div className="max-w-5xl mx-auto flex items-center h-full px-4 gap-4 flex-wrap">
        <p className="font-medium text-sm">Kilpi</p>

        <span className="text-muted-foreground text-sm">·</span>

        <p className="text-muted-foreground text-sm">Next RSC demo</p>

        <div className="flex-1" />

        <p className="text-muted-foreground text-sm">
          Created by{" "}
          <a className="underline" href="https://jussinevavuori.com" target="_blank" rel="noopener">
            Jussi Nevavuori
          </a>
        </p>

        <span className="text-muted-foreground text-sm">·</span>

        <p className="text-muted-foreground text-sm">
          View{" "}
          <a className="underline" href="https://vercel.kilpi.app" target="_blank" rel="noopener">
            Kilpi documentation
          </a>
        </p>
        <span className="text-muted-foreground text-sm">·</span>

        <p className="text-muted-foreground text-sm">
          Source code available on{" "}
          <a
            className="underline"
            href="https://github.com/Jussinevavuori/kilpi/tree/main/examples/next-rsc-demo"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}

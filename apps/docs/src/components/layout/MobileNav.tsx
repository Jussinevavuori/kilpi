import { cn } from "@/utils/cn";
import { MenuIcon } from "lucide-react";
import type { SidebarFolder } from "../docs/getSidebar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/Drawer";
import { SvgLogos } from "../ui/SvgLogos";
import { buttonVariants } from "../variants/buttonVariants";
import { MobileNavFolder } from "./MobileNavFolder";

export type MobileNavProps = {
  docsSidebar: SidebarFolder;

  socialLinks: Array<{
    type: string;
    href: string;
    name: string;
    username: string;
  }>;
};

export function MobileNav(props: MobileNavProps) {
  const linkClassName = (extraClassName: string = "") =>
    cn(
      buttonVariants({ size: "icon", variant: "ghost" }),
      "w-full px-4 -mx-2 w-[calc(100%_+_1rem)] justify-start shrink-0",
      extraClassName,
    );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={buttonVariants({ size: "icon", variant: "ghost", className: "md:hidden" })}
        >
          <MenuIcon />
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>Navigation</DrawerTitle>
        </DrawerHeader>

        <nav className="flex max-h-[70vh] flex-col overflow-y-auto overflow-x-hidden px-4">
          <a href="/" className={linkClassName()}>
            Home
          </a>
          <a href="/blog" className={linkClassName()}>
            Blog
          </a>

          <hr className="my-4" />
          <MobileNavFolder linkClassName={linkClassName} folder={props.docsSidebar} />
          <hr className="my-4" />

          {props.socialLinks.map((social) => (
            <a
              href={social.href}
              key={social.type}
              target="_blank"
              rel="noreferrer noopener"
              className={linkClassName()}
            >
              {
                {
                  github: <SvgLogos.Github className="size-4" />,
                  bluesky: <SvgLogos.BlueSky className="size-4" />,
                }[social.type]
              }
              <span>{social.name}</span>
              <span className="text-muted-fg">{social.username}</span>
            </a>
          ))}
        </nav>

        <DrawerFooter>
          <DrawerClose asChild>
            <button className={buttonVariants({ variant: "outline", className: "w-full" })}>
              Close
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

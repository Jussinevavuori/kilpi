import type { Subject } from "@/kilpi.server";
import { Kilpi } from "@/kilpi.server";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { ChangeRoleButton } from "./ChangeRoleButton";
import { SignOutButton } from "./SignOutButton";

export type HeaderProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Header(props: HeaderProps) {
  return (
    <header className={cn("sticky top-0 flex flex-col bg-black p-4 text-white", props.className)}>
      <div className="flex flex-row flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex flex-row flex-wrap items-center gap-4">
          <span className="text-3xl">🐢</span>
          <span className="text-2xl font-bold tracking-tighter">Kilpi Demo</span>
        </Link>
        <div className="flex flex-row flex-wrap items-center gap-4">
          <a
            href="https://kilpi.vercel.app"
            target="_blank"
            className="font-semibold tracking-tight underline"
          >
            Kilpi Docs
          </a>
          <a
            href="https://kilpi.vercel.app"
            target="_blank"
            className="font-semibold tracking-tight underline"
          >
            Kilpi on GitHub
          </a>
          <a
            href="https://jussinevavuori.com"
            target="_blank"
            className="font-semibold tracking-tight underline opacity-50"
          >
            By Jussi Nevavuori
          </a>
        </div>
      </div>

      <hr className="-mx-4 my-4 border-white/20" />

      {props.children}
    </header>
  );
}

export function UnauthenticatedHeaderContent() {
  return (
    <div className="fle-row flex flex-wrap items-center justify-center gap-2">
      <p className="opacity-50">Not signed in</p>
      <span className="opacity-50">·</span>
      <Link href="/sign-in" className="font-semibold tracking-tight underline">
        Sign in
      </Link>
      <span className="opacity-50">·</span>
      <Link href="/sign-up" className="font-semibold tracking-tight underline">
        Sign up
      </Link>
    </div>
  );
}

export type AuthenticatedHeaderContentProps = {
  subject: NonNullable<Subject>;
};

export function AuthenticatedHeaderContent({ subject }: AuthenticatedHeaderContentProps) {
  return (
    <div className="fle-row flex flex-wrap items-center justify-center gap-2">
      <p>Signed in as</p>
      <p>{subject.email}</p>
      <span className="opacity-50">·</span>
      <p>{subject.role}</p>
      <span className="opacity-50">·</span>
      <Link href="/create-article" className="font-semibold tracking-tight underline">
        Create Article
      </Link>
      <span className="opacity-50">·</span>
      <ChangeRoleButton className="font-semibold tracking-tight underline" />
      <span className="opacity-50">·</span>
      <SignOutButton className="font-semibold tracking-tight underline" />
    </div>
  );
}

export async function HeaderContent() {
  const { subject } = await Kilpi.always().authorize().assert();

  if (subject) {
    return <AuthenticatedHeaderContent subject={subject} />;
  }

  return <UnauthenticatedHeaderContent />;
}

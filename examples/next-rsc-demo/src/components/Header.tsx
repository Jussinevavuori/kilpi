import { Access, Kilpi } from "@/kilpi";
import { Subject } from "@/kilpi.subject";
import Link from "next/link";
import { ChangeRoleButton } from "./ChangeRoleButton";
import { SignOutButton } from "./SignOutButton";
import { Button } from "./ui/button";

export function Header_Unauthenticated() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-5xl mx-auto flex items-center h-full justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Kilpi News
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="secondary">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Header_Authenticated({ user }: { user: NonNullable<Subject> }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      {/* Super header for signed in users */}
      <div className="bg-black text-white">
        <div className="max-w-5xl mx-auto gap-2 flex items-center h-full px-4 py-1">
          <p className="text-sm font-medium">Signed in as {user.name}</p>

          <div className="flex-1" />

          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-sm font-medium">·</p>
          <p className="text-sm font-medium">{user.role || "no role"}</p>
          <p className="text-sm font-medium">·</p>
          <ChangeRoleButton className="cursor-pointer hover:opacity-80 underline text-sm font-medium" />
          <p className="text-sm font-medium">·</p>
          <SignOutButton className="cursor-pointer hover:opacity-80 underline text-sm font-medium" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto flex items-center h-full justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Kilpi News
          </Link>
        </div>

        {/* Actions, based on whether signed in or not */}
        <div className="flex items-center gap-2">
          <Access to="articles:create">
            <Button asChild>
              <Link href="/create-article">Create article</Link>
            </Button>
          </Access>
        </div>
      </div>
    </header>
  );
}

export async function Header() {
  const user = await Kilpi.getSubject();
  return user ? <Header_Authenticated user={user} /> : <Header_Unauthenticated />;
}

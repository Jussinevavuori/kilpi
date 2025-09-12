"use client";

import { authClient } from "@/better-auth.client";
import { toast } from "sonner";

export function SignOutButton({ children, ...ButtonProps }: React.ComponentProps<"button">) {
  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess() {
          window.location.pathname = "/";
        },
        onError({ error }) {
          toast.error(error.message || "Failed to sign out");
        },
      },
    });
  }

  return (
    <button {...ButtonProps} onClick={handleSignOut}>
      {children || "Sign out"}
    </button>
  );
}

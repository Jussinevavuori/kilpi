"use client";

import { authClient } from "@/better-auth.client";
import { Button, ButtonProps } from "@/components/ui/button";
import { toast } from "sonner";

export type SignOutButtonProps = ButtonProps;

export function SignOutButton({ children, ...ButtonProps }: SignOutButtonProps) {
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
    <Button {...ButtonProps} onClick={handleSignOut}>
      {children || "Sign out"}
    </Button>
  );
}

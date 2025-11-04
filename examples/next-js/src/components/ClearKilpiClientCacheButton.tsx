"use client";

import { KilpiClient } from "@/kilpi.client";
import { cn } from "@/utils/cn";
import { useEffect } from "react";

export type ClearKilpiClientCacheButtonProps = {
  className?: string;
};

export function ClearKilpiClientCacheButton(props: ClearKilpiClientCacheButtonProps) {
  useEffect(() => {
    return KilpiClient.$hooks.onCacheInvalidate((e) => {
      console.log("Kilpi Client Cache invalidated", e.key);
    });
  });

  return (
    <button
      className={cn("cursor-pointer", props.className)}
      onClick={() => {
        KilpiClient.$invalidate();
      }}
    >
      Clear Kilpi Client Cache
    </button>
  );
}

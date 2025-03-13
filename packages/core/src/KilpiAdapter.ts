import type { KilpiContext } from "./KilpiContext";

export type KilpiAdapterInitializer = (options: { defaults?: KilpiContext }) => KilpiAdapter;

export type KilpiAdapter = {
  getContext: () => KilpiContext | undefined;
};

"use client";

import { createKilpiClient } from "@kilpi/client";
import { ReactClientComponentPlugin } from "@kilpi/react-client";
import type { Kilpi } from "./kilpi.js";

export const KilpiClient = createKilpiClient({
  infer: {} as typeof Kilpi, // Infer subject and policies from server instance
  connect: {
    endpointUrl: process.env.NEXT_PUBLIC_KILPI_URL!,
    secret: process.env.NEXT_PUBLIC_KILPI_SECRET!,
  },
  plugins: [ReactClientComponentPlugin()],
});

export const { useIsAuthorized, useSubject, ClientAccess } =
  KilpiClient.ReactClient.createComponents();

import { createKilpiClient } from "@kilpi/client";
import { ReactClientPlugin } from "@kilpi/react-client";
import type { Kilpi } from "./kilpi.server";

export const KilpiClient = createKilpiClient({
  infer: {} as typeof Kilpi,
  connect: {
    secret: process.env.NEXT_PUBLIC_KILPI_SECRET!,
    endpointUrl: process.env.NEXT_PUBLIC_KILPI_URL!,
  },
  plugins: [ReactClientPlugin()],
});

export const { AuthorizeClient } = KilpiClient.$createReactClientComponents();

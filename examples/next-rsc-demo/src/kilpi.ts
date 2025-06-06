import "server-only";

import { createKilpi } from "@kilpi/core";
import { ReactServerComponentPlugin } from "@kilpi/react-server";
import { redirect } from "next/navigation";
import { policies } from "./kilpi.policies";
import { getSubject } from "./kilpi.subject";

/**
 * Initialize Kilpi server client
 */
export const Kilpi = createKilpi({
  getSubject,
  policies,

  /**
   * Enable React server components.
   */
  plugins: [ReactServerComponentPlugin()],

  /**
   * By default, redirect to home page when user is unauthorized to access a resource. Setting up
   * a default `onUnauthorized` handler is a good practice. It can also redirect to a login page,
   * or a forbidden page for example.
   */
  settings: {
    defaultOnUnauthorized() {
      redirect("/");
    },
  },
});

/**
 * Create & export React server components
 */
export const { Access } = Kilpi.ReactServer.createComponents();

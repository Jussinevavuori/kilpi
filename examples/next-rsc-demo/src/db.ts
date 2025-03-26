import { Database } from "bun:sqlite";

/**
 * Create sqlite database for ease of testing and seeding.
 */
export const db = new Database("demo-db.sqlite", { create: true });

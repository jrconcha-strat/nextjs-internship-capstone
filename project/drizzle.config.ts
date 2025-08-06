import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.IS_USING_NEON!.toLowerCase() === "true" ? process.env.NEON_DATABASE_URL! : process.env.DOCKERPG_DATABASE_URL!,
  },
});

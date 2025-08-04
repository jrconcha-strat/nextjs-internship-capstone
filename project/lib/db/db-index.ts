import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import * as relations from "../../drizzle/relations"

// Because we're using .env.local, we have to configure the path. 
// Have to use dotenv to load the env vars before execution. 
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); 

const client = neon(process.env.DATABASE_URL!);

// Solves querying by relations issue. https://github.com/drizzle-team/drizzle-orm/discussions/2718
export const db = drizzle(client, { schema: { ...schema, ...relations } });

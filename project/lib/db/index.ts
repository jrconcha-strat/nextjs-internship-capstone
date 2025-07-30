import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Because we're using .env.local, we have to configure the path. 
// Have to use dotenv to load the env vars before execution. 
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); 

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });

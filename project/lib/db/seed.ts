import { seed } from "drizzle-seed";
import { db } from "./index";
import * as schema from "./schema"
import { sql } from "drizzle-orm";

// Run this file by running pnpm run db:seed
async function main() {
    await seed(db, {users: schema.users}, {count:10, seed: 143});
    // Set the sequence for the users ID table to the id of the last entry that seed function generated.
    // This is so that when webhook runs, it assigns the correct unused id instead of conflicting with an already created user.
    // e.g seed function generates 10 users, but sequence is still at 1, so when webhook runs, it tries assigning id 1 and fails.
    await db.execute(sql`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`);
}

main();
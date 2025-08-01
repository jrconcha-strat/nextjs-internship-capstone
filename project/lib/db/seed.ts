import { reset, seed } from "drizzle-seed";
import { db } from "./db-index";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

// Run this file by running pnpm run db:seed
async function main() {
  // Reset the db and its id sequence.
  // https://orm.drizzle.team/docs/seed-overview#reset-database
  // https://www.postgresql.org/docs/current/functions-sequence.html
  await reset(db, schema);
  await db.execute(
    sql`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users), false);`,
  );
  await db.execute(
    sql`SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects), false);`,
  );
  await db.execute(
    sql`SELECT setval('lists_id_seq', (SELECT MAX(id) FROM lists), false);`,
  );
  await db.execute(
    sql`SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks), false);`,
  );
  await db.execute(
    sql`SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments), false);`,
  );

  // Generate dummy data
  // https://orm.drizzle.team/docs/seed-functions#valuesfromarray
  // https://orm.drizzle.team/docs/seed-overview#refinements
  await seed(db, {
    users: schema.users,
    projects: schema.projects,
    lists: schema.lists,
    tasks: schema.tasks,
    comments: schema.comments,
    roles: schema.roles,
    teams: schema.teams,
    users_to_teams: schema.users_to_teams,
    teams_to_projects: schema.teams_to_projects,
    users_to_tasks: schema.users_to_tasks,
  }).refine((f) => ({
    users: {
      columns: {},
      count: 5,
    },
    projects: {
      count: 5,
      columns: {
        ownerId: f.valuesFromArray({ values: [1, 2, 3, 4, 5], isUnique: true }),
      },
    },
    lists: {
      count: 25,
      columns: {
        projectId: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
      },
    },
    tasks: {
      count: 25,
      columns: {
        listId: f.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: 25 }, (_, i) => i + 1),
        }),
      },
    },
    comments: {
      count: 25,
      columns: {
        content: f.loremIpsum(),
        authorId: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
        taskId: f.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: 25 }, (_, i) => i + 1),
        }),
      },
    },
    roles: {
      count: 5,
      columns: {
        role_name: f.valuesFromArray({
          isUnique: true,
          values: [
            "No Role Yet", // Default
            "Project Manager",
            "Developer",
            "QA Engineer",
            "Designer",
          ],
        }),
      },
    },
    teams: {
      count: 5,
      columns: {},
    },
    users_to_teams: {
      count: 5,
      columns: {
        role: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
        team_id: f.valuesFromArray({ isUnique: true, values: [1, 2, 3, 4, 5] }),
        user_id: f.valuesFromArray({ isUnique: true, values: [1, 2, 3, 4, 5] }),
      },
    },
    teams_to_projects: {
      count: 5,
      columns: {
        role: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
        team_id: f.valuesFromArray({ isUnique: true, values: [1, 2, 3, 4, 5] }),
        user_id: f.valuesFromArray({ isUnique: true, values: [1, 2, 3, 4, 5] }),
      },
    },
    users_to_tasks: {
      count: 25,
      columns: {
        task_id: f.valuesFromArray({
          isUnique: true,
          values: Array.from({ length: 25 }, (_, i) => i + 1),
        }),
        user_id: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
      },
    },
  }));
  // Set the id sequence value for the following tables to the id of the last entry that seed function generated, with is_called true.
  // So, on next webhook run, it assigns the next unused id.
  // e.g seed function generates 10 users, but sequence is still at 1, so when webhook runs, it tries assigning id 1 and fails.
  await db.execute(
    sql`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));`,
  );
  await db.execute(
    sql`SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));`,
  );
  await db.execute(
    sql`SELECT setval('lists_id_seq', (SELECT MAX(id) FROM lists));`,
  );
  await db.execute(
    sql`SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));`,
  );
  await db.execute(
    sql`SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));`,
  );
}

main();

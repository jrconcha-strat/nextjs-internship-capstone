/*
## Notes ##
  - Many to Many Relations necessitates the use of a junction table for best practices.
  - Logging feature may be necessary.

  # On Project Creation
    - At the least one team may be assigned to a project, with the option for more.
    - A project cannot be created without an assigned team.
    - On project creation inquire:
      - Option 1: Create a new team for this project?
        - Creator of the Project is the project manager.
      - Option 2: Assign an existing team for this project.
  
  # On Team Creation
    - A team shall consist of only One PM
  
  # On Team Deletion
    - A team cannot be deleted/disbanded if it is still assigned to a project. Re-assign the project to another team first.
    

  Primary Relations:
    1. Users <-> Teams    | Many to Many 
    2. Teams <-> Projects | Many to Many
    3. Projects -> Lists  | One to Many 
    4. Lists -> Tasks     | One to Many 
    5. Tasks -> Comments  | One to Many
    6. Tasks <-> Users    | Many to Many  

  Indexes:
    1. Partial Indexes on:
  

  Enforce via Triggers to enforce the following:
    1. (projects) ownerId	Must be a member of the team assigned to the project
    2. (users_to_tasks) user_id Must be a member of the team for the assigned task
    3. (comments) authorId	Must be a member of the team assigned to the project
*/

import {
  pgTable,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  primaryKey,
  foreignKey,
  unique,
} from "drizzle-orm/pg-core";
import { priorityEnum, rolesEnum, statusEnum } from "./db-enums";
export { priorityEnum, rolesEnum, statusEnum } from "./db-enums";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  clerkId: varchar("clerk_id").notNull().unique(),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  image_url: varchar("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  teamName: varchar("teamName").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  role_name: rolesEnum("role_name").notNull().unique().default("No Role Yet"),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  status: statusEnum().notNull().default("Planning"),
  ownerId: integer("ownerId")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const lists = pgTable("lists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  name: varchar("name").notNull(),
  projectId: integer("projectId")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  title: varchar("title").notNull(),
  description: text("description"),
  listId: integer("listId")
    .references(() => lists.id, { onDelete: "cascade" })
    .notNull(),
  priority: priorityEnum("priority").notNull(),
  dueDate: timestamp("dueDate"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable(
  "comments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
    content: text("content"),
    taskId: integer("taskId")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    authorId: integer("authorId")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    parentCommentId: integer("parentCommentId"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  // https://stackoverflow.com/questions/78329576/how-to-declare-self-referencing-foreign-key-with-drizzle-orm
  // https://orm.drizzle.team/docs/indexes-constraints#foreign-key
  (table) => [
    foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: "comments_self_reference_id",
    }).onDelete("cascade"),
  ],
);

export const task_labels = pgTable("task_labels", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  taskId: integer("taskId")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(),
  color: varchar("color").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Junction Table modeling the many to many relationship between teams and users. Utilize indexing composite primary key indexing strategy.
export const users_to_teams = pgTable(
  "users_to_teams",
  {
    team_id: integer("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    user_id: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    isLeader: boolean("isLeader").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.team_id, table.user_id] })],
);

// Junction Table modeling the many to many relationship between tasks and users. Utilize indexing composite primary key indexing strategy.
export const users_to_tasks = pgTable(
  "users_to_tasks",
  {
    task_id: integer("task_id")
      .references(() => tasks.id, { onDelete: "cascade" })
      .notNull(),
    user_id: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.user_id] })],
);

export const teams_to_projects = pgTable(
  "teams_to_projects",
  {
    team_id: integer("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    project_id: integer("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.team_id, table.project_id] })],
);

export const project_members = pgTable(
  "project_members",
  {
    team_id: integer("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    project_id: integer("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    user_id: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    role: integer("role")
      .references(() => roles.id, { onDelete: "restrict" })
      .notNull()
      .default(1), // "No Role Yet" default
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.team_id, table.project_id, table.user_id] }),
  ],
);

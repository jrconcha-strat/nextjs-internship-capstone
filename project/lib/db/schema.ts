/*
## Notes ##
  - Many to Many Relations necessitates the use of a junction table for best practices.
  - Logging feature is necessary.

  # On the Concept of Deletion
    - Hard Deletion is restricted to preserve historical accuracy. Instead, employ soft deleiton via isArchived to flag deleted objects.
    - This requires writing logic at the app level to archive relations / child objects, because postgresql only supports cascading of hard deletion and not this logic at the db level.
    - What can be soft-deleted or archived through the UI? (e.g there is a link or button to delete this object)
        - Users
        - Teams
        - Projects
        - Lists
        - Tasks
        - Comments
    - Cases:
      - A user is archived? Do the logic for:
          - Archiving all team_members entries.
            - if IsCreator, allow archival to retain history.
          - Archiving all task_assignees entries.
            - if isTaskOwner, allow archival to retain history.
          - Archiving all comments entries
          - Conditional archivals:
            - If user.id == projects.ownerId and project.status != completed:
              - Restrict user archival. Indicate that project owner must change to a non-archived user before allowing archival. Show UI to change owner assigned. Owner should be on the same team.
              - Log this action
            - else if user.id == projects.ownerId and project.status == completed:
              - Allow user archival
      - A project is archived? Do the logic for:
        - Archiving all child lists
        - Archiving all child tasks of those lists.
        - Archiving all child comments of those child tasks.
        - Archiving all task_assignees entries of those tasks.
      - A team is archived? Do the logic for:
        - Archiving all team_members entries.
        - Conditional archivals:
          - if team is assigned to an active project
            - Restrict team archival. Indicate that project must be assigned to another team, before allowing team archival. Show UI to change team assigned.
            - Log this action.
          - else team is assigned to no active project
            - Allow team archival
      - A list is archived? Do the logic for:
        - Archiving all child tasks of those lists.
        - Archiving all child comments of those child tasks.
        - Archiving all task_assignees entries of those tasks.
      - A task is archived? Do the logic for:
        - Archiving all child comments of those child tasks.
        - Archiving all task_assignees entries of those tasks.
      - A comment is archived? Do the logic for:
        - Archiving all task_assignees entries of those tasks.
      

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
    2. (tasks) assigneeId	Must be a member of the team for the assigned task
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
} from "drizzle-orm/pg-core";
import { priorityEnum, rolesEnum, statusEnum } from "./enums";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  clerkId: varchar("clerk_id").notNull().unique(),
  email: varchar("email").notNull().unique(),
  name: varchar("name").notNull(),
  image_url: varchar("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export const teams = pgTable("teams", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  teamName: varchar("teamName").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export const roles = pgTable("roles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  role_name: rolesEnum("role_name").notNull().unique().default("No Role Yet"),
});

export const projects = pgTable("projects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  name: varchar("name").notNull(),
  description: text("description"),
  status: statusEnum().notNull().default("Planning"),
  ownerId: integer("ownerId")
    .references(() => users.id)
    .notNull(),
  teamId: integer("teamId")
    .references(() => teams.id)
    .notNull(),
  dueDate: timestamp("dueDate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export const lists = pgTable("lists", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  name: varchar("name").notNull(),
  projectId: integer("projectId").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export const tasks = pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  title: varchar("title").notNull(),
  description: text("description"),
  listId: integer("listId").notNull(),
  priority: priorityEnum("priority").default("unselected").notNull(),
  labels: text("labels").array(),
  dueDate: timestamp("dueDate"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),
  content: text("content"),
  taskId: integer("taskId")
    .references(() => tasks.id)
    .notNull(),
  authorId: integer("authorId").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isArchived: boolean("isArchived").default(false).notNull(),
  archivedAt: timestamp("archivedAt"),
});

// Junction Table modeling the many to many relationship between teams and users. Utilize indexing composite primary key indexing strategy.
export const users_to_teams = pgTable(
  "users_to_teams",
  {
    team_id: integer("team_id")
      .references(() => teams.id)
      .notNull(),
    user_id: integer("user_id")
      .references(() => users.id)
      .notNull(),
    role: integer("role").notNull().default(1), // "No Role Yet" default
    isCreator: boolean("isCreator").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isArchived: boolean("isArchived").notNull().default(false),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [primaryKey({ columns: [table.team_id, table.user_id] })],
);

// Junction Table modeling the many to many relationship between tasks and users. Utilize indexing composite primary key indexing strategy.
export const users_to_tasks = pgTable(
  "users_to_tasks",
  {
    task_id: integer("task_id")
      .references(() => tasks.id)
      .notNull(),
    user_id: integer("user_id")
      .references(() => users.id)
      .notNull(),
    isTaskOwner: boolean("isTaskOwner").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    isArchived: boolean("isArchived").notNull().default(false),
    archivedAt: timestamp("archived_at"),
  },
  (table) => [primaryKey({ columns: [table.task_id, table.user_id] })],
);

export const teams_to_projects = pgTable(
  "teams_to_projects",
  {
    team_id: integer("team_id")
      .references(() => teams.id)
      .notNull(),
    project_id: integer("project_id")
      .references(() => projects.id)
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.team_id, table.project_id] })],
);

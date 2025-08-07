import { pgTable, foreignKey, integer, varchar, text, timestamp, unique, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const priority = pgEnum("priority", ['unselected', 'low', 'medium', 'high'])
export const roleName = pgEnum("role_name", ['No Role Yet', 'Project Manager', 'Developer', 'QA Engineer', 'Designer'])
export const status = pgEnum("status", ['Completed', 'On-hold', 'In Progress', 'Planning', 'Review'])


export const tasks = pgTable("tasks", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "tasks_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	title: varchar().notNull(),
	description: text(),
	listId: integer().notNull(),
	priority: priority().default('unselected').notNull(),
	dueDate: timestamp({ mode: 'string' }),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.listId],
			foreignColumns: [lists.id],
			name: "tasks_listId_lists_id_fk"
		}).onDelete("cascade"),
]);

export const comments = pgTable("comments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "comments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	content: text(),
	taskId: integer().notNull(),
	authorId: integer().notNull(),
	parentCommentId: integer(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [users.id],
			name: "comments_authorId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "comments_taskId_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comments_self_reference_id"
		}).onDelete("cascade"),
]);

export const projects = pgTable("projects", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "projects_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	description: text(),
	status: status().default('Planning').notNull(),
	ownerId: integer().notNull(),
	dueDate: timestamp({ mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [users.id],
			name: "projects_ownerId_users_id_fk"
		}).onDelete("restrict"),
]);

export const lists = pgTable("lists", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "lists_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar().notNull(),
	projectId: integer().notNull(),
	position: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "lists_projectId_projects_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	clerkId: varchar("clerk_id").notNull(),
	email: varchar().notNull(),
	name: varchar().notNull(),
	imageUrl: varchar("image_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
	unique("users_email_unique").on(table.email),
]);

export const taskLabels = pgTable("task_labels", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "task_labels_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	taskId: integer().notNull(),
	name: varchar().notNull(),
	category: varchar().notNull(),
	color: varchar().notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_labels_taskId_tasks_id_fk"
		}).onDelete("cascade"),
]);

export const roles = pgTable("roles", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "roles_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	roleName: roleName("role_name").default('No Role Yet').notNull(),
}, (table) => [
	unique("roles_role_name_unique").on(table.roleName),
]);

export const teams = pgTable("teams", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "teams_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	teamName: varchar().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("teams_teamName_unique").on(table.teamName),
]);

export const teamsToProjects = pgTable("teams_to_projects", {
	teamId: integer("team_id").notNull(),
	projectId: integer("project_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "teams_to_projects_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "teams_to_projects_project_id_projects_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.teamId, table.projectId], name: "teams_to_projects_team_id_project_id_pk"}),
]);

export const usersToTasks = pgTable("users_to_tasks", {
	taskId: integer("task_id").notNull(),
	userId: integer("user_id").notNull(),
	isTaskOwner: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "users_to_tasks_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_tasks_user_id_users_id_fk"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.taskId, table.userId], name: "users_to_tasks_task_id_user_id_pk"}),
]);

export const usersToTeams = pgTable("users_to_teams", {
	teamId: integer("team_id").notNull(),
	userId: integer("user_id").notNull(),
	role: integer().default(1).notNull(),
	isCreator: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teamId],
			foreignColumns: [teams.id],
			name: "users_to_teams_team_id_teams_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "users_to_teams_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.role],
			foreignColumns: [roles.id],
			name: "users_to_teams_role_roles_id_fk"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.teamId, table.userId], name: "users_to_teams_team_id_user_id_pk"}),
]);

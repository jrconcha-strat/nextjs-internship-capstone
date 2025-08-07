import { relations } from "drizzle-orm/relations";
import { lists, tasks, users, comments, projects, task_labels, teams, teams_to_projects, users_to_tasks, users_to_teams, roles } from "./schema";

export const tasksRelations = relations(tasks, ({one, many}) => ({
	list: one(lists, {
		fields: [tasks.listId],
		references: [lists.id]
	}),
	comments: many(comments),
	task_labels: many(task_labels),
	users_to_tasks: many(users_to_tasks),
}));

export const listsRelations = relations(lists, ({one, many}) => ({
	tasks: many(tasks),
	project: one(projects, {
		fields: [lists.projectId],
		references: [projects.id]
	}),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	user: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	task: one(tasks, {
		fields: [comments.taskId],
		references: [tasks.id]
	}),
	comment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
		relationName: "comments_parentCommentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentCommentId_comments_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	comments: many(comments),
	projects: many(projects),
	users_to_tasks: many(users_to_tasks),
	users_to_teams: many(users_to_teams),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	user: one(users, {
		fields: [projects.ownerId],
		references: [users.id]
	}),
	lists: many(lists),
	teams_to_projects: many(teams_to_projects),
}));

export const task_labelsRelations = relations(task_labels, ({one}) => ({
	task: one(tasks, {
		fields: [task_labels.taskId],
		references: [tasks.id]
	}),
}));

export const teams_to_projectsRelations = relations(teams_to_projects, ({one}) => ({
	team: one(teams, {
		fields: [teams_to_projects.team_id],
		references: [teams.id]
	}),
	project: one(projects, {
		fields: [teams_to_projects.project_id],
		references: [projects.id]
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	teams_to_projects: many(teams_to_projects),
	users_to_teams: many(users_to_teams),
}));

export const users_to_tasksRelations = relations(users_to_tasks, ({one}) => ({
	task: one(tasks, {
		fields: [users_to_tasks.task_id],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [users_to_tasks.user_id],
		references: [users.id]
	}),
}));

export const users_to_teamsRelations = relations(users_to_teams, ({one}) => ({
	team: one(teams, {
		fields: [users_to_teams.team_id],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [users_to_teams.user_id],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [users_to_teams.role],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	users_to_teams: many(users_to_teams),
}));
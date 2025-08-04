import { relations } from "drizzle-orm/relations";
import { tasks, taskLabels, comments, projects, lists, users, teams, teamsToProjects, usersToTasks, usersToTeams, roles } from "./schema";

export const taskLabelsRelations = relations(taskLabels, ({one}) => ({
	task: one(tasks, {
		fields: [taskLabels.taskId],
		references: [tasks.id]
	}),
}));

export const tasksRelations = relations(tasks, ({many}) => ({
	taskLabels: many(taskLabels),
	comments: many(comments),
	usersToTasks: many(usersToTasks),
}));

export const commentsRelations = relations(comments, ({one}) => ({
	task: one(tasks, {
		fields: [comments.taskId],
		references: [tasks.id]
	}),
}));

export const listsRelations = relations(lists, ({one}) => ({
	project: one(projects, {
		fields: [lists.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({one, many}) => ({
	lists: many(lists),
	user: one(users, {
		fields: [projects.ownerId],
		references: [users.id]
	}),
	teamsToProjects: many(teamsToProjects),
}));

export const usersRelations = relations(users, ({many}) => ({
	projects: many(projects),
	usersToTasks: many(usersToTasks),
	usersToTeams: many(usersToTeams),
}));

export const teamsToProjectsRelations = relations(teamsToProjects, ({one}) => ({
	team: one(teams, {
		fields: [teamsToProjects.teamId],
		references: [teams.id]
	}),
	project: one(projects, {
		fields: [teamsToProjects.projectId],
		references: [projects.id]
	}),
}));

export const teamsRelations = relations(teams, ({many}) => ({
	teamsToProjects: many(teamsToProjects),
	usersToTeams: many(usersToTeams),
}));

export const usersToTasksRelations = relations(usersToTasks, ({one}) => ({
	task: one(tasks, {
		fields: [usersToTasks.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [usersToTasks.userId],
		references: [users.id]
	}),
}));

export const usersToTeamsRelations = relations(usersToTeams, ({one}) => ({
	team: one(teams, {
		fields: [usersToTeams.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [usersToTeams.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [usersToTeams.role],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	usersToTeams: many(usersToTeams),
}));
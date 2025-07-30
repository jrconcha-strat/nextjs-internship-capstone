/*
Ref: users_to_teams.team_id > teams.id          [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a team is archived, in team_members, archive all entries using the archived team's id.
Ref: users_to_teams.user_id > users.id          [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a user is archived, in team_members, archive all entries using the archived user's id.
Ref: projects.ownerId > users.id                [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading.
Ref: teams_to_projects.team_id > teams.id       [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading.
Ref: teams_to_projects.project_id > projects.id [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading.
Ref: lists.projectId > projects.id              [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a project is archived, in lists, archive all entries using the archived project's id.
Ref: tasks.listId > lists.id                    [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a list is archived, in tasks, archive all entries using the archived list's id.
Ref: users_to_tasks.task_id > tasks.id          [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a task is archived, in tasks_assignees, archive all entries using the archived task's id.
Ref: users_to_tasks.user_id > users.id          [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a user is archived, in tasks_assignees, archive all entries using the archived user's id.
Ref: comments.taskId > tasks.id                 [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a task is archived, in comments, archive all entries using the archived task's id.
Ref: comments.authorId > users.id               [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading. If a user is archived, in comments, archive all entries using the archived user's id.
Ref: users_to_teams.role > roles.id             [delete: no action, update: no action]  // Refer to the section on soft-deletion above for app logic cascading.
*/

import { relations } from "drizzle-orm";
import {
  comments,
  lists,
  projects,
  roles,
  tasks,
  teams,
  teams_to_projects,
  users,
  users_to_tasks,
  users_to_teams,
} from "./schema";

export const users_to_teamsRelations = relations(users_to_teams, ({ one }) => ({
  role_in_team: one(roles, {
    fields: [users_to_teams.role],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  team_users: many(users),
}));

export const usersRelations = relations(users, ({ many }) => ({
  usersToTeams: many(users_to_teams),
  usersToTasks: many(users_to_tasks),
  projectOwner: many(projects),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  teamsToUsers: many(users_to_teams),
  teamsToProjects: many(teams_to_projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  projectOwner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  projectsToTeams: many(teams_to_projects),
  lists: many(lists),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
  projectParent: one(projects, {
    fields: [lists.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  listParent: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
  }),
  tasksToUsers: many(users_to_tasks),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  taskParent: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
}));

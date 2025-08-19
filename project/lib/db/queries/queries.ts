import { users } from "./user-queries";
import { teams } from "./teams-queries";
import { projects } from "./project-queries";
import { lists } from "./list-queries";
import { tasks } from "./task-queries";
import { comments } from "./comment-queries";

// Note: CRUD queries expect ZOD validated data.

export const queries = {
  users: users,
  projects: projects,
  lists: lists,
  tasks: tasks,
  comments: comments,
  teams: teams,
};

"use server";

import { TaskSelect, UserSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { taskSchemaDB, taskSchemaForm } from "../lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";

// Fetches
export async function getTaskMembersAction(task_id: number): Promise<ServerActionResponse<UserSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.tasks.getTaskMembers(task_id);
}

export async function getTasksCountForProjectAction(project_id: number): Promise<ServerActionResponse<number>> {
  await checkAuthenticationStatus();
  return await queries.tasks.getTasksCountForProject(project_id);
}

export async function getTasksByListIdAction(project_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.tasks.getByList(project_id);
}

// Mutations
export async function deleteTaskAction(task_id: number): Promise<ServerActionResponse<TaskSelect>> {
  await checkAuthenticationStatus();
  return await queries.tasks.delete(task_id);
}

export async function createTaskAction(
  list_id: number,
  position: number,
  taskFormData: z.infer<typeof taskSchemaForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  await checkAuthenticationStatus();

  const taskDBData: z.infer<typeof taskSchemaDB> = {
    ...taskFormData,
    listId: list_id,
    position: position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assignedIds = taskFormData.assigneeIds;

  return await queries.tasks.create(taskDBData, assignedIds);
}

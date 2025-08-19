"use server";

import { TaskSelect, UserSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { idSchema, taskSchema, taskSchemaDB, taskSchemaForm } from "../lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse } from "@/lib/db/queries/query_utils";

// Fetches
export async function getTaskMembersAction(task_id: number): Promise<ServerActionResponse<UserSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTaskMembers(task_id);
}

export async function getTasksCountForProjectAction(project_id: number): Promise<ServerActionResponse<number>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getTasksCountForProject(project_id);
}

export async function getTasksByProjectAction(project_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: project_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getByProject(project_id);
}

export async function getTasksByListIdAction(list_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: list_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getByList(list_id);
}

export async function getTaskByIdAction(task_id: number): Promise<ServerActionResponse<TaskSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.tasks.getById(task_id);
}

// Mutations
export async function deleteTaskAction(task_id: number): Promise<ServerActionResponse<TaskSelect>> {
  await checkAuthenticationStatus();

  const parsed = idSchema.safeParse({ id: task_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

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

  // Zod strips unknown keys.
  const parsed = taskSchemaDB.safeParse(taskDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const assignedIds = taskFormData.assigneeIds;

  return await queries.tasks.create(taskDBData, assignedIds);
}

export async function updateTaskAction(
  task_id: number,
  taskFormData?: z.infer<typeof taskSchemaForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  await checkAuthenticationStatus();

  const res = await queries.tasks.getById(task_id);
  if (!res.success) return res;

  const taskDBData: z.infer<typeof taskSchema> = {
    ...res.data,
    ...taskFormData,
  };

  const parsed = taskSchema.safeParse(taskDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const assignedIds = taskFormData ? taskFormData.assigneeIds : null;

  return await queries.tasks.update(task_id, taskDBData, assignedIds);
}

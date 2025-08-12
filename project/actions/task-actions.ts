"use server";

import { TaskSelect, UserSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { taskSchemaDB, taskSchemaForm } from "../lib/validations/validations";
import z from "zod";
import { revalidatePath } from "next/cache";

export async function deleteTaskAction(task_id: number, project_id: number): Promise<ServerActionResponse<TaskSelect>> {
  const res = await queries.tasks.delete(task_id);

  revalidatePath(`/projects/${project_id}`);
  return res.success ? res : res;
}

export async function getTaskMembersAction(task_id: number): Promise<ServerActionResponse<UserSelect[]>> {
  const res = await queries.tasks.getTaskMembers(task_id);

  return res.success ? res : res;
}

export async function getTasksCountForProjectAction(project_id: number): Promise<ServerActionResponse<number>> {
  const res = await queries.tasks.getTasksCountForProject(project_id);

  return res.success ? res : res;
}

export async function createTaskAction(
  project_id: number,
  list_id: number,
  position: number,
  taskFormData: z.infer<typeof taskSchemaForm>,
): Promise<ServerActionResponse<TaskSelect>> {
  // Construct the data object to be inserted to the database

  const taskDBData: z.infer<typeof taskSchemaDB> = {
    title: taskFormData.title,
    description: taskFormData.description,
    listId: list_id,
    priority: taskFormData.priority,
    dueDate: taskFormData.dueDate,
    position: position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const assignedIds = taskFormData.assigneeIds;

  const res = await queries.tasks.create(taskDBData, assignedIds);

  revalidatePath(`/projects/${project_id}`);

  return res.success ? res : res;
}

export async function getTasksByListIdAction(project_id: number): Promise<ServerActionResponse<TaskSelect[]>> {
  const res = await queries.tasks.getByList(project_id);

  return res.success ? res : res;
}

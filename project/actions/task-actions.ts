"use server";

import { TaskSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { taskSchemaDB, taskSchemaForm } from "../lib/validations/validations";
import z from "zod";
import { revalidatePath } from "next/cache";

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

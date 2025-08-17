"use server";
import { ListSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { listSchemaDB, listSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";

// Fetches
export async function getAllListsAction(project_id: number): Promise<ServerActionResponse<ListSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.lists.getByProject(project_id);
}

// Mutations
export async function createListAction(
  project_id: number,
  position: number,
): Promise<ServerActionResponse<ListSelect>> {
  await checkAuthenticationStatus();

  const listDBData: z.infer<typeof listSchemaDB> = {
    name: "New Board",
    projectId: project_id,
    position: position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return await queries.lists.create(listDBData);
}

export async function updateListAction(
  list_id: number,
  listFormData: z.infer<typeof listSchemaForm>,
): Promise<ServerActionResponse<ListSelect>> {
  await checkAuthenticationStatus();

  // Check if exists
  const res = await queries.lists.getById(list_id);
  if (!res.success) return res;

  const listDBData: z.infer<typeof listSchemaDB> = {
    ...res.data,
    name: listFormData.name,
  };

  return await queries.lists.update(list_id, listDBData);
}

export async function deleteListAction(list_id: number): Promise<ServerActionResponse<ListSelect>> {
  await checkAuthenticationStatus();
  return await queries.lists.delete(list_id);
}

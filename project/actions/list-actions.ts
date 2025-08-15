"use server";
import { ListSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { revalidatePath } from "next/cache";
import { listSchemaDB, listSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { checkAuthenticationStatus } from "./actions-utils";

export async function updateListAction(
  project_id: number,
  list_id: number,
  listFormData: z.infer<typeof listSchemaForm>,
): Promise<ServerActionResponse<ListSelect>> {
  checkAuthenticationStatus();

  const getExistingListResponse = await queries.lists.getById(list_id);
  if (!getExistingListResponse.success) {
    return getExistingListResponse;
  }

  const listDBData: z.infer<typeof listSchemaDB> = {
    ...getExistingListResponse.data,
    name: listFormData.name,
  };

  const updateListResponse = await queries.lists.update(list_id, listDBData);

  revalidatePath(`/projects/${project_id}`);

  return updateListResponse.success ? updateListResponse : updateListResponse;
}

export async function deleteListAction(project_id: number, list_id: number): Promise<ServerActionResponse<ListSelect>> {
  checkAuthenticationStatus();

  const deleteListResponse = await queries.lists.delete(list_id);

  revalidatePath(`/projects/${project_id}`);

  return deleteListResponse.success ? deleteListResponse : deleteListResponse;
}

export async function createListAction(
  project_id: number,
  position: number,
): Promise<ServerActionResponse<ListSelect>> {
  checkAuthenticationStatus();

  const listDBData: z.infer<typeof listSchemaDB> = {
    name: "New Board",
    projectId: project_id,
    position: position,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createListResponse = await queries.lists.create(listDBData);

  revalidatePath(`/projects/${project_id}`);

  return createListResponse.success ? createListResponse : createListResponse;
}

export async function getAllListsAction(project_id: number): Promise<ServerActionResponse<ListSelect[]>> {
  checkAuthenticationStatus();
  const getAllListsResult = await queries.lists.getByProject(project_id);

  return getAllListsResult.success ? getAllListsResult : getAllListsResult;
}

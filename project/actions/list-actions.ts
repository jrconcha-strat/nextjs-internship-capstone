"use server";
import { ListSelect } from "@/types";
import { ServerActionResponse } from "./actions-types";
import { queries } from "@/lib/db/queries/queries";
import { revalidatePath } from "next/cache";
import { listSchemaDB } from "@/lib/validations/validations";
import z from "zod";

export async function deleteListAction(project_id: number, list_id: number): Promise<ServerActionResponse<ListSelect>> {
  const deleteListResponse = await queries.lists.delete(list_id);

  revalidatePath(`/projects/${project_id}`);

  return deleteListResponse.success ? deleteListResponse : deleteListResponse;
}

export async function createListAction(
  project_id: number,
  position: number,
): Promise<ServerActionResponse<ListSelect>> {
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
  const getAllListsResult = await queries.lists.getByProject(project_id);

  return getAllListsResult.success ? getAllListsResult : getAllListsResult;
}

"use server";

import { projectSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { queries } from "@/lib/db/queries/queries";
import { projectSchemaDB } from "../lib/validations/validations";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "./actions-types";
import * as types from "@/types";
import { revalidatePath } from "next/cache";

export async function updateProjectAction(
  project_id: number,
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  // Get existing project
  const getExistingProjectResponse = await queries.projects.getById(project_id);
  if (!getExistingProjectResponse.success) {
    return getExistingProjectResponse;
  }

  // Construct the projectDBData
  const projectDBData: z.infer<typeof projectSchemaDB> = {
    name: projectFormData.name,
    description: projectFormData.description,
    status: getExistingProjectResponse.data.status,
    ownerId: getExistingProjectResponse.data.ownerId,
    dueDate: projectFormData.dueDate,
    createdAt: getExistingProjectResponse.data.createdAt,
    updatedAt: new Date(),
  };

  const updateProjectResponse = await queries.projects.update(project_id, projectDBData);

  revalidatePath("/projects");

  return updateProjectResponse.success ? updateProjectResponse : updateProjectResponse;
}

export async function deleteProjectAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  const deleteProjectResponse = await queries.projects.delete(project_id);

  revalidatePath("/projects");

  return deleteProjectResponse.success ? deleteProjectResponse : deleteProjectResponse;
}

export async function createProjectAction(
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  // Retrieve project creator's clerkId
  const { userId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "Unable to get current user.",
      error: "Unable to get the userId in createProject server action.",
    };
  }
  // Use project creator clerkId to retrieve database userid
  const getByClerkIdResponse = await queries.users.getByClerkId(userId);
  if (!getByClerkIdResponse.success) {
    return getByClerkIdResponse;
  }

  const projectOwnerId = getByClerkIdResponse.data.id;

  // Construct the projectDBData,
  const projectDBData: z.infer<typeof projectSchemaDB> = {
    name: projectFormData.name,
    description: projectFormData.description,
    status: "Planning",
    ownerId: projectOwnerId,
    dueDate: projectFormData.dueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Create project
  const createProjectResponse = await queries.projects.create(projectDBData);

  revalidatePath("/projects");

  return createProjectResponse.success ? createProjectResponse : createProjectResponse;
}

export async function checkProjectNameUnique(ProjectName: string): Promise<ServerActionResponse<boolean>> {
  // call utility function to check project nameuniqueness.
  const nameIsUniqueResponse = await queries.projects.checkProjectNameUnique(ProjectName);

  // Ternary to narrow the response type.
  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

export async function getProjectByIdAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  const getProjectByIDResult = await queries.projects.getById(project_id);

  return getProjectByIDResult.success ? getProjectByIDResult : getProjectByIDResult;
}
export async function getAllProjects(): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  const getAllProjectsResult = await queries.projects.getAll();

  return getAllProjectsResult.success ? getAllProjectsResult : getAllProjectsResult;
}

export async function getAllMembersForProject(project_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  const getAllMembersForProjectResult = await queries.projects.getAllMembersForProject(project_id);

  return getAllMembersForProjectResult.success ? getAllMembersForProjectResult : getAllMembersForProjectResult;
}

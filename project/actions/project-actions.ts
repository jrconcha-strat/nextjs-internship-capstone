"use server";

import { projectSchemaForm, projectSchemaUpdateForm } from "@/lib/validations/validations";
import z from "zod";
import { queries } from "@/lib/db/queries/queries";
import { projectSchemaDB } from "../lib/validations/validations";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "./actions-types";
import * as types from "@/types";
import { revalidatePath } from "next/cache";
import { checkAuthenticationStatus } from "./actions-utils";

export async function getProjectsForUserAction(user_id: number): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  checkAuthenticationStatus();
  const getProjectsForUserResponse = await queries.projects.getProjectsForUser(user_id);
  return getProjectsForUserResponse.success ? getProjectsForUserResponse : getProjectsForUserResponse;
}

export async function updateProjectAction(
  project_id: number,
  projectFormData: z.infer<typeof projectSchemaUpdateForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  checkAuthenticationStatus();
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
  checkAuthenticationStatus();
  const deleteProjectResponse = await queries.projects.delete(project_id);

  revalidatePath("/projects");

  return deleteProjectResponse.success ? deleteProjectResponse : deleteProjectResponse;
}

export async function createProjectAction(
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  checkAuthenticationStatus();

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

  //
  const assignedTeams: number[] = projectFormData.teamIds;

  // Create project
  const createProjectResponse = await queries.projects.create(projectDBData, assignedTeams);

  revalidatePath("/projects");

  return createProjectResponse.success ? createProjectResponse : createProjectResponse;
}

export async function checkProjectNameUnique(ProjectName: string): Promise<ServerActionResponse<boolean>> {
  checkAuthenticationStatus();
  const nameIsUniqueResponse = await queries.projects.checkProjectNameUnique(ProjectName);

  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

export async function getProjectByIdAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  checkAuthenticationStatus();
  const getProjectByIDResult = await queries.projects.getById(project_id);

  return getProjectByIDResult.success ? getProjectByIDResult : getProjectByIDResult;
}
export async function getAllProjects(): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  checkAuthenticationStatus();
  const getAllProjectsResult = await queries.projects.getAll();

  return getAllProjectsResult.success ? getAllProjectsResult : getAllProjectsResult;
}

export async function getAllMembersForProject(project_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  checkAuthenticationStatus();
  const getAllMembersForProjectResult = await queries.projects.getAllMembersForProject(project_id);

  return getAllMembersForProjectResult.success ? getAllMembersForProjectResult : getAllMembersForProjectResult;
}

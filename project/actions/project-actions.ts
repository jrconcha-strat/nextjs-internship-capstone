"use server";

import { projectSchemaForm, projectSchemaUpdateForm } from "@/lib/validations/validations";
import z from "zod";
import { queries } from "@/lib/db/queries/queries";
import { projectSchemaDB } from "../lib/validations/validations";
import { ServerActionResponse } from "./actions-types";
import * as types from "@/types";
import { checkAuthenticationStatus } from "./actions-utils";
import { getUserId } from "./user-actions";
import { failResponse } from "@/lib/db/queries/query_utils";

// Utility
export async function checkProjectNameUnique(ProjectName: string): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();
  return await queries.projects.checkProjectNameUnique(ProjectName);
}

// Fetches
export async function getProjectsForUserAction(user_id: number): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.projects.getProjectsForUser(user_id);
}

export async function getProjectByIdAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();
  return await queries.projects.getById(project_id);
}

export async function getAllProjects(): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.projects.getAll();
}

export async function getAllMembersForProject(project_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.projects.getAllMembersForProject(project_id);
}

// Mutations
export async function createProjectAction(
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();

  const res = await getUserId();
  if (!res.success) return res;

  const projectDBData: z.infer<typeof projectSchemaDB> = {
    ...projectFormData,
    status: "Planning",
    ownerId: res.data.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed = projectSchemaDB.safeParse(projectDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, parsed.error);

  const assignedTeams: number[] = projectFormData.teamIds;
  return await queries.projects.create(projectDBData, assignedTeams);
}

export async function updateProjectAction(
  project_id: number,
  projectFormData: z.infer<typeof projectSchemaUpdateForm>,
): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();

  const res = await queries.projects.getById(project_id);
  if (!res.success) return res;

  const projectDBData: z.infer<typeof projectSchemaDB> = {
    ...res.data,
    ...projectFormData,
    updatedAt: new Date(),
  };

  const parsed = projectSchemaDB.safeParse(projectDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, parsed.error);

  return await queries.projects.update(project_id, projectDBData);
}

export async function deleteProjectAction(project_id: number): Promise<ServerActionResponse<types.ProjectSelect>> {
  await checkAuthenticationStatus();
  return await queries.projects.delete(project_id);
}

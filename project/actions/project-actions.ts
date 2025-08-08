"use server";

import { projectSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { queries } from "@/lib/db/queries/queries";
import { projectSchemaDB } from "../lib/validations/validations";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "./actions-types";
import { ProjectSelect } from "@/types";

export async function createProject(
  projectFormData: z.infer<typeof projectSchemaForm>,
): Promise<ServerActionResponse<ProjectSelect>> {
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

  return createProjectResponse.success ? createProjectResponse : createProjectResponse;
}

"use server";

import { queries } from "@/lib/db/queries/queries";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "./actions-types";
import * as types from "../types/index";
import { checkAuthenticationStatus } from "./actions-utils";

export async function getAllUsers(): Promise<ServerActionResponse<types.UserSelect[]>> {
  checkAuthenticationStatus();
  const response = await queries.users.getAll();

  return response.success ? response : response;
}

export async function getUserId(): Promise<ServerActionResponse<types.UserSelect>> {
  checkAuthenticationStatus();
  const { userId } = await auth();

  if (!userId || userId === null) {
    throw new Error("Unable to get logged in user's id from Clerk.");
  }

  const getUserByClerkIdResponse = await queries.users.getByClerkId(userId);
  return getUserByClerkIdResponse.success ? getUserByClerkIdResponse : getUserByClerkIdResponse;
}

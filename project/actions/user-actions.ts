"use server";

import { queries } from "@/lib/db/queries/queries";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "./actions-types";
import * as types from "../types/index";
import { checkAuthenticationStatus } from "./actions-utils";

// Fetches
export async function getAllUsers(): Promise<ServerActionResponse<types.UserSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.users.getAll();
}

export async function getUserId(): Promise<ServerActionResponse<types.UserSelect>> {
  await checkAuthenticationStatus();

  const { userId } = await auth();

  if (!userId || userId === null) throw new Error("Unable to get logged in user's id from Clerk.");

  return await queries.users.getByClerkId(userId);
}

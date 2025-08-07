"use server";

import { queries } from "@/lib/db/queries/queries";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "../actions-types";
import * as types from "../../types/index";

export async function getAllUsers(): Promise<ServerActionResponse<types.UserSelect[]>> {
  const response = await queries.users.getAll();

  return response.success ? response : response;
}

export async function getUserId(): Promise<ServerActionResponse<types.UserSelect>> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("userId is null.");
    }

    const response = await queries.users.getByClerkId(userId);
    if (!response.success) {
      return response;
    }

    return {
      success: true,
      message: `User id of currently logged in user has been retrieved.`,
      data: response.data,
    };
  } catch (e) {
    return {
      success: false,
      message: `Unable to retrieve user id.`,
      error: e,
    };
  }
}

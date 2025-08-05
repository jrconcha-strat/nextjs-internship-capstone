"use server";

import { queries } from "@/lib/db/queries/queries";
import { auth } from "@clerk/nextjs/server";
import { GetUserIdResponse } from "./user-types";

export async function getUserId(): Promise<GetUserIdResponse> {
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

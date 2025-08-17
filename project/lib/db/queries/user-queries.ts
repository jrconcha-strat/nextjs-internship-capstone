import * as types from "../../../types/index";
import { db } from "../db-index";
import { failResponse, getAllObject, getObjectById, successResponse } from "./query_utils";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

export const users = {
  getAll: async (): Promise<types.QueryResponse<Array<types.UserSelect>>> => {
    return getAllObject<types.UserSelect>("users");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.UserSelect>> => {
    return getObjectById<types.UserSelect>(id, "users");
  },
  getByClerkId: async (clerkId: string): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const [user] = await db.select().from(schema.users).limit(1).where(eq(schema.users.clerkId, clerkId));
      if (user) return successResponse(`Successfully retrieved user.`, user);
      throw new Error(`User does not exist.`);
    } catch (e) {
      return failResponse(`Unable to retrieve user.`, e);
    }
  },
  createUser: async (data: types.UserInsert): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const [response] = await db.insert(schema.users).values(data).returning();
      if (response) return successResponse(`Successfully created user.`, response);
      else return failResponse(`Unable to create user.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to create user.`, e);
    }
  },
  updateUser: async (
    userClerkIdToBeUpdated: string,
    data: types.UserInsert,
  ): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const [response] = await db
        .update(schema.users)
        .set(data)
        .where(eq(schema.users.clerkId, userClerkIdToBeUpdated))
        .returning();
      if (response) return successResponse(`Successfully updated user.`, response);
      else return failResponse(`Unable to update user.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to create user.`, e);
    }
  },
  deleteUser: async (userClerkIdToBeDeleted: string): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const [response] = await db
        .delete(schema.users)
        .where(eq(schema.users.clerkId, userClerkIdToBeDeleted))
        .returning();
      if (response) return successResponse(`Successfully deleted user.`, response);
      else return failResponse(`Unable to delete user.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to delete user.`, e);
    }
  },
};

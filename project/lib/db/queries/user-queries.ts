import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById } from "./query_utils";
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
      if (user) {
        return {
          success: true,
          message: `User retrieved using clerkId: ${clerkId}.`,
          data: user,
        };
      }
      throw new Error(`User does not exist.`);
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve user using clerkId: ${clerkId}.`,
        error: e,
      };
    }
  },
  createUser: async (data: types.UserInsert): Promise<types.QueryResponse<types.UserInsert>> => {
    try {
      const response = await db.insert(schema.users).values(data);
      if (response.rowCount === 1) {
        return {
          success: true,
          message: `Successful insertion into the users table of user with clerk id: ${JSON.stringify(data.clerkId)}`,
          data: data,
        };
      } else {
        return {
          success: false,
          message: `Unsuccessful insertion into the users table of user with clerk id: ${JSON.stringify(data.clerkId)}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unsuccessful insertion into the users table.`,
        error: `Errors: ${e}`,
      };
    }
  },
  updateUser: async (
    userClerkIdToBeUpdated: string,
    data: types.UserInsert,
  ): Promise<types.QueryResponse<types.UserInsert>> => {
    try {
      const response = await db.update(schema.users).set(data).where(eq(schema.users.clerkId, userClerkIdToBeUpdated));

      // Check if updating is successful or not
      if (response.rowCount === 1) {
        return {
          success: true,
          message: `Successful updating into the users table of user with clerk id: ${JSON.stringify(data.clerkId)}`,
          data: data,
        };
      } else {
        return {
          success: false,
          message: `Unsuccessful updating into the users table of user with clerk id: ${JSON.stringify(data.clerkId)}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unsuccessful updating of user in users table.`,
        error: `Errors: ${e}`,
      };
    }
  },
  deleteUser: async (userClerkIdToBeDeleted: string): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      // Delete user api call
      const [response] = await db
        .delete(schema.users)
        .where(eq(schema.users.clerkId, userClerkIdToBeDeleted))
        .returning();

      if (response) {
        return {
          success: true,
          message: `Successful deletion in users table of user with clerk id: ${userClerkIdToBeDeleted}`,
          data: response,
        };
      } else {
        return {
          success: false,
          message: `Unsuccessful deletion in users table of user with clerk id:. ${userClerkIdToBeDeleted}`,
          error: `Error: response returned no data. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Webhook Action: Unsuccessful archival of user in users table.`,
        error: `Errors: ${e}`,
      };
    }
  },
};

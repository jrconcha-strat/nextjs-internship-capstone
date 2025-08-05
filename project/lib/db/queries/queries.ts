import * as types from "../../../types/index";
import {
  createObject,
  getAllObject,
  getByParentObject,
  getObjectById,
  deleteObject,
  updateObject,
} from "./query_utils";
import { db } from "../db-index";
import { users } from "../schema";
import { eq, and, isNotNull } from "drizzle-orm";
import * as schema from "../schema";
import { teams } from "./teams-queries";

// Note: CRUD queries expect ZOD validated data.

export const queries = {
  users: {
    getAll: async (): Promise<types.QueryResponse<Array<types.UserSelect>>> => {
      return getAllObject<types.UserSelect>("users");
    },
    getById: async (
      id: number,
    ): Promise<types.QueryResponse<types.UserSelect>> => {
      return getObjectById<types.UserSelect>(id, "users");
    },
    getByClerkId: async (
      clerkId: string,
    ): Promise<types.QueryResponse<types.UserSelect>> => {
      try {
        const [user] = await db
          .select()
          .from(schema.users)
          .limit(1)
          .where(eq(schema.users.clerkId, clerkId));
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
    checkUserArchiveStatus: async (
      id: number | string,
    ): Promise<types.QueryResponse<types.UserSelect>> => {
      let archivedUser;
      try {
        if (typeof id === "number") {
          [archivedUser] = await db
            .select()
            .from(users)
            .limit(1)
            .where(and(eq(users.id, id), isNotNull(users.archivedAt)));
        } else {
          [archivedUser] = await db
            .select()
            .from(users)
            .limit(1)
            .where(and(eq(users.clerkId, id), isNotNull(users.archivedAt)));
        }

        if (archivedUser) {
          return {
            success: true,
            message: `User is currently archived.`,
            data: archivedUser,
          };
        }
        throw new Error(`User does not exist.`);
      } catch (e) {
        return {
          success: false,
          message: `Unable to check user archival status.`,
          error: e,
        };
      }
    },
    createUser: async (
      data: types.UserInsert,
    ): Promise<types.QueryResponse<types.UserInsert>> => {
      try {
        const response = await db.insert(users).values(data);
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
        const response = await db
          .update(users)
          .set(data)
          .where(eq(users.clerkId, userClerkIdToBeUpdated));

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
    deleteUser: async (
      userClerkIdToBeDeleted: string,
    ): Promise<types.QueryResponse<types.UserSelect>> => {
      try {
        // Set soft-deletion fields
        const response = await db
          .update(users)
          .set({ archivedAt: new Date() })
          .where(eq(users.clerkId, userClerkIdToBeDeleted));

        // Check if deletion is successful or not. Find user using deletedUserClerkID and verify if isArchived flag is set to true.
        const [result] = await db
          .select()
          .from(users)
          .limit(1)
          .where(
            and(
              eq(users.clerkId, userClerkIdToBeDeleted),
              isNotNull(users.archivedAt),
            ),
          );

        if (response.rowCount === 1) {
          return {
            success: true,
            message: `Successful archival in users table of user with clerk id: ${JSON.stringify(result.clerkId)}`,
            data: result,
          };
        } else {
          return {
            success: false,
            message: `Unsuccessful archival in users table of user with clerk id:. ${JSON.stringify(result.clerkId)}`,
            error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
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
  },
  projects: {
    getAll: async (): Promise<
      types.QueryResponse<Array<types.ProjectSelect>>
    > => {
      return getAllObject<types.ProjectSelect>("projects");
    },
    getById: async (
      id: number,
    ): Promise<types.QueryResponse<types.ProjectSelect>> => {
      return getObjectById<types.ProjectSelect>(id, "projects");
    },
    create: async (
      data: types.ProjectInsert,
    ): Promise<types.QueryResponse<types.ProjectInsert>> => {
      return createObject<types.ProjectInsert>(data, "projects");
    },
    update: async (
      id: number,
      data: types.ProjectInsert,
    ): Promise<types.QueryResponse<types.ProjectInsert>> => {
      return updateObject<types.ProjectSelect, types.ProjectInsert>(
        id,
        data,
        "projects",
        queries.projects.getById,
        (existing, incoming) => {
          const changed: Partial<types.ProjectInsert> = {};
          if (existing.name !== incoming.name) changed.name = incoming.name;
          if (existing.status !== incoming.status)
            changed.status = incoming.status;
          if (existing.ownerId !== incoming.ownerId)
            changed.ownerId = incoming.ownerId;
          if (existing.description !== incoming.description)
            changed.description = incoming.description;
          if (existing.dueDate !== incoming.dueDate)
            changed.dueDate = incoming.dueDate;
          if (existing.archivedAt !== incoming.archivedAt)
            changed.archivedAt = incoming.archivedAt;
          return changed;
        },
        (existing) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...base } = existing;
          return base;
        },
      );
    },
    delete: async (
      id: number,
    ): Promise<types.QueryResponse<types.ProjectSelect>> => {
      // Call Generic function to delete object
      return deleteObject<types.ProjectSelect>(id, "projects");
    },
  },
  lists: {
    getByProject: async (
      projectId: number,
    ): Promise<types.QueryResponse<Array<types.ListSelect>>> => {
      return getByParentObject<types.ListSelect>(projectId, "lists");
    },
    getById: async (
      id: number,
    ): Promise<types.QueryResponse<types.ListSelect>> => {
      return getObjectById<types.ListSelect>(id, "lists");
    },
    create: async (
      data: types.ListInsert,
    ): Promise<types.QueryResponse<types.ListInsert>> => {
      return createObject<types.ListInsert>(data, "lists");
    },
    update: async (
      id: number,
      data: types.ListInsert,
    ): Promise<types.QueryResponse<types.ListInsert>> => {
      return updateObject<types.ListSelect, types.ListInsert>(
        id,
        data,
        "lists",
        queries.lists.getById,
        (existing, incoming) => {
          const changed: Partial<types.ListSelect> = {};
          if (existing.name != incoming.name) changed.name = incoming.name;
          if (existing.position != incoming.position)
            changed.position = incoming.position;
          if (existing.archivedAt != incoming.archivedAt)
            changed.archivedAt = incoming.archivedAt;
          return changed;
        },
        (existing) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...base } = existing;
          return base;
        },
      );
    },
    delete: async (
      id: number,
    ): Promise<types.QueryResponse<types.ListSelect>> => {
      // Call Generic function to delete object
      return deleteObject<types.ListSelect>(id, "lists");
    },
  },
  tasks: {
    getByList: async (
      listId: number,
    ): Promise<types.QueryResponse<Array<types.TaskSelect>>> => {
      return getByParentObject<types.TaskSelect>(listId, "tasks");
    },
    getById: async (
      id: number,
    ): Promise<types.QueryResponse<types.TaskSelect>> => {
      return getObjectById<types.TaskSelect>(id, "tasks");
    },
    create: async (
      data: types.TaskInsert,
    ): Promise<types.QueryResponse<types.TaskInsert>> => {
      return createObject<types.TaskInsert>(data, "tasks");
    },
    update: async (
      id: number,
      data: types.TaskInsert,
    ): Promise<types.QueryResponse<types.TaskInsert>> => {
      return updateObject<types.TaskSelect, types.TaskInsert>(
        id,
        data,
        "tasks",
        queries.tasks.getById,
        (existing, incoming) => {
          const changed: Partial<types.TaskSelect> = {};
          if (existing.position != incoming.position)
            changed.position = incoming.position;
          if (existing.title != incoming.title) changed.title = incoming.title;
          if (existing.description != incoming.description)
            changed.description = incoming.description;
          if (existing.dueDate != incoming.dueDate)
            changed.dueDate = incoming.dueDate;
          if (existing.priority != incoming.priority)
            changed.priority = incoming.priority;
          if (existing.archivedAt != incoming.archivedAt)
            changed.archivedAt = incoming.archivedAt;
          return changed;
        },
        (existing) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...base } = existing;
          return base;
        },
      );
    },
    delete: async (
      id: number,
    ): Promise<types.QueryResponse<types.TaskSelect>> => {
      // Call Generic function to delete object
      return deleteObject<types.TaskSelect>(id, "tasks");
    },
  },
  comments: {
    getByTask: async (
      taskId: number,
    ): Promise<types.QueryResponse<Array<types.CommentSelect>>> => {
      return getByParentObject<types.CommentSelect>(taskId, "comments");
    },
    getById: async (
      id: number,
    ): Promise<types.QueryResponse<types.CommentSelect>> => {
      return getObjectById<types.CommentSelect>(id, "comments");
    },
    create: async (
      data: types.CommentInsert,
    ): Promise<types.QueryResponse<types.CommentInsert>> => {
      return createObject<types.CommentInsert>(data, "comments");
    },
    update: async (
      id: number,
      data: types.CommentInsert,
    ): Promise<types.QueryResponse<types.CommentInsert>> => {
      return updateObject<types.CommentSelect, types.CommentInsert>(
        id,
        data,
        "comments",
        queries.comments.getById,
        (existing, incoming) => {
          const changed: Partial<types.CommentInsert> = {};
          if (existing.content != incoming.content)
            changed.content = incoming.content;
          if (existing.archivedAt != incoming.archivedAt)
            changed.archivedAt = incoming.archivedAt;
          return changed;
        },
        (existing) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...base } = existing;
          return base;
        },
      );
    },
    delete: async (
      id: number,
    ): Promise<types.QueryResponse<types.CommentSelect>> => {
      // Call Generic function to delete object
      return deleteObject<types.CommentSelect>(id, "comments");
    },
  },
  teams: teams,
};
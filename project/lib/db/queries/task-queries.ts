import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { lists } from "./list-queries";
import { getObjectById, updateObject, getByParentObject } from "./query_utils";
import { inArray, eq, sql, and, gt } from "drizzle-orm";

export const tasks = {
  getTaskMembers: async (task_id: number): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      const res = await db
        .select({ users: schema.users })
        .from(schema.tasks)
        .innerJoin(schema.users_to_tasks, eq(schema.users_to_tasks.task_id, schema.tasks.id))
        .innerJoin(schema.users, eq(schema.users.id, schema.users_to_tasks.user_id))
        .where(eq(schema.tasks.id, task_id));

      // Unwrap
      const taskMembers = res.map((r) => r.users);

      // Return the count of tasks
      return {
        success: true,
        message: "Task members retrieve successfully.",
        data: taskMembers,
      };
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve task members.`,
        error: e,
      };
    }
  },
  getTasksCountForProject: async (project_id: number): Promise<types.QueryResponse<number>> => {
    try {
      // Get the project lists
      const projectLists = await lists.getByProject(project_id);

      if (!projectLists.success) {
        return projectLists;
      }

      // Extract the list IDs
      const projectListIds: number[] = projectLists.data.map((list) => list.id);

      // Retrieve tasks where the listId is in projectListIds
      const tasksOfProject = await db
        .select({ tasks: schema.tasks })
        .from(schema.tasks)
        .where(inArray(schema.tasks.listId, projectListIds)); // Filter tasks if they're in this project through the list.

      // Return the count of tasks
      return {
        success: true,
        message: "Task count retrieved successfully.",
        data: tasksOfProject.length,
      };
    } catch (e) {
      return {
        success: false,
        message: `Unable to get task count for project.`,
        error: e,
      };
    }
  },
  getByList: async (listId: number): Promise<types.QueryResponse<Array<types.TaskSelect>>> => {
    return getByParentObject<types.TaskSelect>(listId, "tasks");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.TaskSelect>> => {
    return getObjectById<types.TaskSelect>(id, "tasks");
  },
  create: async (
    data: types.TaskInsert,
    assignedIds: number[] | null,
  ): Promise<types.QueryResponse<types.TaskSelect>> => {
    try {
      const newTask = data;
      const now = new Date();

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.TaskSelect>> => {
        const [insertedTask] = await tx.insert(schema.tasks).values(newTask).returning();
        if (!insertedTask) {
          throw new Error(`Database did not return a task. Check connection.`);
        }

        // Assign members, if any.
        if (assignedIds) {
          const membersToAssign: types.UsersToTasksSelect[] = assignedIds.map((id) => ({
            user_id: id,
            task_id: insertedTask.id,
            createdAt: now,
            updatedAt: now,
          }));

          const assignedMembers = await tx.insert(schema.users_to_tasks).values(membersToAssign).returning();
          if (assignedMembers.length !== assignedIds.length) {
            throw new Error("Not all members were assigned.");
          }
        }

        return {
          success: true,
          message: "Created task successfully.",
          data: insertedTask,
        };
      });

      // Check if the transaction is successful
      if (txResult.success) {
        return {
          success: true,
          message: `Successfully created new Task.`,
          data: txResult.data,
        };
      }
      throw new Error("Task database creation transaction failed.");
    } catch (e) {
      return {
        success: false,
        message: `Unable to create the task.`,
        error: e,
      };
    }
  },
  update: async (id: number, data: types.TaskInsert): Promise<types.QueryResponse<types.TaskInsert>> => {
    return updateObject<types.TaskSelect, types.TaskInsert>(
      id,
      data,
      "tasks",
      tasks.getById,
      (existing, incoming) => {
        const changed: Partial<types.TaskSelect> = {};
        if (existing.position != incoming.position) changed.position = incoming.position;
        if (existing.title != incoming.title) changed.title = incoming.title;
        if (existing.description != incoming.description) changed.description = incoming.description;
        if (existing.dueDate != incoming.dueDate) changed.dueDate = incoming.dueDate;
        if (existing.priority != incoming.priority) changed.priority = incoming.priority;
        return changed;
      },
      (existing) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...base } = existing;
        return base;
      },
    );
  },
  delete: async (id: number): Promise<types.QueryResponse<types.TaskSelect>> => {
    try {
      const result = await db.transaction<types.QueryResponse<types.TaskSelect>>(async (tx) => {
        // 1) Re-fetch inside the transaction to ensure consistency
        const toDelete = await tx.query.tasks.findFirst({
          where: eq(schema.tasks.id, id),
          columns: { id: true, position: true, listId: true },
        });

        if (!toDelete) {
          return {
            success: false,
            message: "Unable to delete task.",
            error: "Task not found.",
          };
        }

        const { position: deletedPos, listId } = toDelete;

        // 2) Delete the row
        const [deleted] = await tx.delete(schema.tasks).where(eq(schema.tasks.id, id)).returning();

        if (!deleted) {
          return {
            success: false,
            message: "Unable to delete task.",
            error: "Database return no result. Check database connection.",
          };
        }

        // 3) Close the gap: shift positions > deletedPos down by 1 (same project only)
        await tx
          .update(schema.tasks)
          .set({ position: sql`${schema.tasks.position} - 1` })
          .where(and(eq(schema.tasks.listId, listId), gt(schema.tasks.position, deletedPos)));

        // 4) Return.
        return {
          success: true,
          message: "Deleted task successfully.",
          data: deleted,
        };
      });

      return result;
    } catch (e) {
      return {
        success: false,
        message: "Unable to delete task.",
        error: e,
      };
    }
  },
};

import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { getObjectById, deleteObject, updateObject, getByParentObject } from "./query_utils";

export const tasks = {
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
    // Call Generic function to delete object
    return deleteObject<types.TaskSelect>(id, "tasks");
  },
};

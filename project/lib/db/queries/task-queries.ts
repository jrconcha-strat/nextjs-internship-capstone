import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { lists } from "./list-queries";
import { getObjectById, successResponse, failResponse, getBaseFields } from "./query_utils";
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

      return successResponse(`Task members retrieved successfully.`, taskMembers);
    } catch (e) {
      return failResponse(`Unable to task members.`, e);
    }
  },
  getTasksCountForProject: async (project_id: number): Promise<types.QueryResponse<number>> => {
    try {
      const res = await lists.getByProject(project_id);
      if (!res.success) return res;

      const projectLists = res.data;

      // Extract the list IDs
      const projectListIds: number[] = projectLists.map((list) => list.id);

      // Retrieve tasks where the listId is in projectListIds
      const tasksOfProject = await db
        .select({ tasks: schema.tasks })
        .from(schema.tasks)
        .where(inArray(schema.tasks.listId, projectListIds)); // Filter tasks if they're in this project through the list.

      return successResponse(`Task count retrieved successfully.`, tasksOfProject.length);
    } catch (e) {
      return failResponse(`Unable to get task count for project.`, e);
    }
  },
  getByProject: async (projectId: number): Promise<types.QueryResponse<types.TaskSelect[]>> => {
    try {
      const result = await db
        .select()
        .from(schema.tasks)
        .innerJoin(schema.lists, eq(schema.tasks.listId, schema.lists.id))
        .where(eq(schema.lists.projectId, projectId))
        .orderBy(schema.tasks.position);
      
      const tasks = result.map((r) => r.tasks);

      if (tasks.length >= 1) return successResponse(`All tasks retrieved.`, tasks);
      else if (tasks.length === 0) return successResponse(`No tasks yet.`, tasks);
      throw new Error(`No tasks retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve tasks.`, e);
    }
  },
  getByList: async (listId: number): Promise<types.QueryResponse<Array<types.TaskSelect>>> => {
    try {
      const tasks = await db
        .select()
        .from(schema.tasks)
        .where(eq(schema.tasks.listId, listId))
        .orderBy(schema.tasks.position);

      // Check if child objects exist.
      if (tasks.length >= 1) return successResponse(`All tasks retrieved.`, tasks);
      // No child objects for this parent object in the database.
      else if (tasks.length === 0) return successResponse(`No tasks yet.`, tasks);
      throw new Error(`No tasks retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve tasks.`, e);
    }
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
        if (!insertedTask) throw new Error(`Database did not a result.`);

        // Assign members, if any.
        if (assignedIds && assignedIds.length > 0) {
          const membersToAssign: types.UsersToTasksSelect[] = assignedIds.map((id) => ({
            user_id: id,
            task_id: insertedTask.id,
            createdAt: now,
            updatedAt: now,
          }));

          const assignedMembers = await tx.insert(schema.users_to_tasks).values(membersToAssign).returning();
          if (assignedMembers.length !== assignedIds.length) throw new Error("Not all members were assigned.");
        }

        return successResponse(`Created task successfully.`, insertedTask);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      return failResponse(`Unable to create task.`, `Task database creation transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to create task.`, e);
    }
  },
  update: async (
    task_id: number,
    incomingTask: types.TaskInsert,
    assignedIds: number[] | null,
  ): Promise<types.QueryResponse<types.TaskSelect>> => {
    try {
      const response = await tasks.getById(task_id);
      if (!response.success) throw new Error(response.message);

      const existingTask = response.data;

      const changed: Partial<types.TaskSelect> = {};
      if (existingTask.position != incomingTask.position) changed.position = incomingTask.position;
      if (existingTask.title != incomingTask.title) changed.title = incomingTask.title;
      if (existingTask.description != incomingTask.description) changed.description = incomingTask.description;
      if (existingTask.dueDate != incomingTask.dueDate) changed.dueDate = incomingTask.dueDate;
      if (existingTask.priority != incomingTask.priority) changed.priority = incomingTask.priority;

      const finalUpdatedTaskData = {
        ...getBaseFields(existingTask),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0 && assignedIds === null)
        return successResponse(`No changes detected.`, existingTask);

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.TaskSelect>> => {
        // Update the task entry
        const [result] = await tx
          .update(schema.tasks)
          .set(finalUpdatedTaskData)
          .where(eq(schema.tasks.id, task_id))
          .returning();

        // Update assigned members, only if assignedIds is present, and different from existingMembers
        if (assignedIds === null) return successResponse(`Updated task successfully.`, result);

        // Dedupe
        const nextIds = Array.from(new Set(assignedIds));

        const res = await tasks.getTaskMembers(task_id);
        if (!res.success) throw new Error(res.message);

        const currentIds = res.data.map((m) => m.id);
        const currentSet = new Set(currentIds);
        const nextSet = new Set(nextIds);

        // Identify diffs
        const toRemove = currentIds.filter((id) => !nextSet.has(id)); // Return ids that currentId has that next doesn't
        const toAdd = nextIds.filter((id) => !currentSet.has(id)); // Vice versa

        if (toRemove.length === 0 && toAdd.length === 0) {
          return successResponse(`Updated task successfully.`, result);
        }

        // Remove members
        if (toRemove.length > 0) {
          await tx
            .delete(schema.users_to_tasks)
            .where(and(eq(schema.users_to_tasks.task_id, task_id), inArray(schema.users_to_tasks.user_id, toRemove)));
        }

        // Add member
        if (toAdd.length > 0) {
          const now = new Date();
          const rows: types.UsersToTasksSelect[] = toAdd.map((userId) => ({
            user_id: userId,
            task_id,
            createdAt: now,
            updatedAt: now,
          }));

          await tx.insert(schema.users_to_tasks).values(rows);
        }
        return successResponse(`Successfully updated task`, result);
      });

      // Check if update is successful.
      if (txResult.success) return successResponse(txResult.message, txResult.data);
      else return failResponse(`Unable to update task.`, `Task updating database transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to update task.`, e);
    }
  },
  delete: async (id: number): Promise<types.QueryResponse<types.TaskSelect>> => {
    try {
      const txResult = await db.transaction<types.QueryResponse<types.TaskSelect>>(async (tx) => {
        // 1) Re-fetch inside the transaction to ensure consistency
        const toDelete = await tx.query.tasks.findFirst({
          where: eq(schema.tasks.id, id),
          columns: { id: true, position: true, listId: true },
        });

        if (!toDelete) throw new Error("Task not found.");

        const { position: deletedPos, listId } = toDelete;

        // 2) Delete the row
        const [deleted] = await tx.delete(schema.tasks).where(eq(schema.tasks.id, id)).returning();

        if (!deleted) throw new Error("Database returned no result.");

        // 3) Close the gap: shift positions > deletedPos down by 1 (same project only)
        await tx
          .update(schema.tasks)
          .set({ position: sql`${schema.tasks.position} - 1` })
          .where(and(eq(schema.tasks.listId, listId), gt(schema.tasks.position, deletedPos)));

        // 4) Return.
        return successResponse(`Deleted task successfully.`, deleted);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      return failResponse(`Unable to delete task.`, `Task database creation transaction failed.`);
    } catch (e) {
      return failResponse(`Unable to delete task.`, e);
    }
  },
};

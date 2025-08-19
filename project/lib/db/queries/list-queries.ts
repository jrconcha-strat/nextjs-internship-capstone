import { and, eq, gt, sql } from "drizzle-orm";
import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import {
  createObject,
  getObjectById,
  getBaseFields,
  successResponse,
  failResponse,
} from "./query_utils";

export const lists = {
  getByProject: async (projectId: number): Promise<types.QueryResponse<Array<types.ListSelect>>> => {
    try {
      const lists = await db
        .select()
        .from(schema.lists)
        .where(eq(schema.lists.projectId, projectId))
        .orderBy(schema.lists.position);

      if (lists.length >= 1) return successResponse(`All lists retrieved.`, lists);
      else if (lists.length === 0) return successResponse(`No lists yet.`, lists);
      throw new Error(`No lists retrieved.`);
    } catch (e) {
      return failResponse(`Unable to retrieve lists.`, e);
    }
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    return getObjectById<types.ListSelect>(id, "lists");
  },
  create: async (data: types.ListInsert): Promise<types.QueryResponse<types.ListSelect>> => {
    return createObject<types.ListSelect>(data, "lists");
  },
  update: async (id: number, incomingListData: types.ListInsert): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const response = await lists.getById(id);
      if (!response.success) throw new Error(response.message);

      const existingListData = response.data;

      const changed: Partial<types.ListInsert> = {};
      if (existingListData.name != incomingListData.name) changed.name = incomingListData.name;
      if (existingListData.position != incomingListData.position) changed.position = incomingListData.position;

      const finalUpdatedObjectData = {
        ...getBaseFields(existingListData),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingListData);

      const [result] = await db
        .update(schema.lists)
        .set(finalUpdatedObjectData)
        .where(eq(schema.lists.id, id))
        .returning();

      if (result) return successResponse(`Updated list successfully`, result);
      else return failResponse(`Unable to update list.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update list.`, e);
    }
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const result = await db.transaction<types.QueryResponse<types.ListSelect>>(async (tx) => {
        // 1) Re-fetch inside the transaction to ensure consistency
        const toDelete = await tx.query.lists.findFirst({
          where: eq(schema.lists.id, id),
          columns: { id: true, position: true, projectId: true },
        });

        if (!toDelete) return failResponse(`Unable to delete list.`, `List not found`);

        const { position: deletedPos, projectId } = toDelete;

        // 2) Delete the row
        const [deleted] = await tx.delete(schema.lists).where(eq(schema.lists.id, id)).returning();

        if (!deleted) return failResponse(`Unable to delete list.`, `Database returned no result.`);

        // 3) Close the gap: shift positions > deletedPos down by 1 (same project only)
        await tx
          .update(schema.lists)
          .set({ position: sql`${schema.lists.position} - 1` })
          .where(and(eq(schema.lists.projectId, projectId), gt(schema.lists.position, deletedPos)));

        // 4) Return.
        return successResponse(`Deleted list successfully.`, deleted);
      });

      return result;
    } catch (e) {
      return failResponse(`Unable to delete list.`, e);
    }
  },
};

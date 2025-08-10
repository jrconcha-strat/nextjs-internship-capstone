import { and, eq, gt, sql } from "drizzle-orm";
import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { createObject, getObjectById, updateObject, getByParentObject } from "./query_utils";

export const lists = {
  getByProject: async (projectId: number): Promise<types.QueryResponse<Array<types.ListSelect>>> => {
    return getByParentObject<types.ListSelect>(projectId, "lists");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    return getObjectById<types.ListSelect>(id, "lists");
  },
  create: async (data: types.ListInsert): Promise<types.QueryResponse<types.ListSelect>> => {
    return createObject<types.ListSelect>(data, "lists");
  },
  update: async (id: number, data: types.ListInsert): Promise<types.QueryResponse<types.ListInsert>> => {
    return updateObject<types.ListSelect, types.ListInsert>(
      id,
      data,
      "lists",
      lists.getById,
      (existing, incoming) => {
        const changed: Partial<types.ListSelect> = {};
        if (existing.name != incoming.name) changed.name = incoming.name;
        if (existing.position != incoming.position) changed.position = incoming.position;
        return changed;
      },
      (existing) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...base } = existing;
        return base;
      },
    );
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    try {
      const result = await db.transaction<types.QueryResponse<types.ListSelect>>(async (tx) => {
        // 1) Re-fetch inside the transaction to ensure consistency
        const toDelete = await tx.query.lists.findFirst({
          where: eq(schema.lists.id, id),
          columns: { id: true, position: true, projectId: true },
        });

        if (!toDelete) {
          return {
            success: false,
            message: "Unable to delete list.",
            error: "List not found.",
          };
        }

        const { position: deletedPos, projectId } = toDelete;

        // 2) Delete the row
        const [deleted] = await tx.delete(schema.lists).where(eq(schema.lists.id, id)).returning();

        if (!deleted) {
          return {
            success: false,
            message: "Unable to delete list.",
            error: "Delete returned 0 rows. Check database connection.",
          };
        }

        // 3) Close the gap: shift positions > deletedPos down by 1 (same project only)
        await tx
          .update(schema.lists)
          .set({ position: sql`${schema.lists.position} - 1` })
          .where(and(eq(schema.lists.projectId, projectId), gt(schema.lists.position, deletedPos)));

        // 4) Return.
        return {
          success: true,
          message: "Deleted list successfully.",
          data: deleted,
        };
      });

      return result;
    } catch (e) {
      return {
        success: false,
        message: "Unable to delete list.",
        error: e,
      };
    }
  },
};

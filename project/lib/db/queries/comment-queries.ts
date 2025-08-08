import * as types from "../../../types/index";
import { createObject, getObjectById, deleteObject, updateObject, getByParentObject } from "./query_utils";

export const comments = {
  getByTask: async (taskId: number): Promise<types.QueryResponse<Array<types.CommentSelect>>> => {
    return getByParentObject<types.CommentSelect>(taskId, "comments");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.CommentSelect>> => {
    return getObjectById<types.CommentSelect>(id, "comments");
  },
  create: async (data: types.CommentInsert): Promise<types.QueryResponse<types.CommentInsert>> => {
    return createObject<types.CommentInsert>(data, "comments");
  },
  update: async (id: number, data: types.CommentInsert): Promise<types.QueryResponse<types.CommentInsert>> => {
    return updateObject<types.CommentSelect, types.CommentInsert>(
      id,
      data,
      "comments",
      comments.getById,
      (existing, incoming) => {
        const changed: Partial<types.CommentInsert> = {};
        if (existing.content != incoming.content) changed.content = incoming.content;
        return changed;
      },
      (existing) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...base } = existing;
        return base;
      },
    );
  },
  delete: async (id: number): Promise<types.QueryResponse<types.CommentSelect>> => {
    // Call Generic function to delete object
    return deleteObject<types.CommentSelect>(id, "comments");
  },
};

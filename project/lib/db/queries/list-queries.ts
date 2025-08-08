import * as types from "../../../types/index";
import { createObject, getObjectById, deleteObject, updateObject, getByParentObject } from "./query_utils";

export const lists = {
  getByProject: async (projectId: number): Promise<types.QueryResponse<Array<types.ListSelect>>> => {
    return getByParentObject<types.ListSelect>(projectId, "lists");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ListSelect>> => {
    return getObjectById<types.ListSelect>(id, "lists");
  },
  create: async (data: types.ListInsert): Promise<types.QueryResponse<types.ListInsert>> => {
    return createObject<types.ListInsert>(data, "lists");
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
    // Call Generic function to delete object
    return deleteObject<types.ListSelect>(id, "lists");
  },
};

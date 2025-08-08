import * as types from "../../../types/index";
import { createObject, getObjectById, deleteObject, updateObject, getByParentObject } from "./query_utils";

export const tasks = {
  getByList: async (listId: number): Promise<types.QueryResponse<Array<types.TaskSelect>>> => {
    return getByParentObject<types.TaskSelect>(listId, "tasks");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.TaskSelect>> => {
    return getObjectById<types.TaskSelect>(id, "tasks");
  },
  create: async (data: types.TaskInsert): Promise<types.QueryResponse<types.TaskInsert>> => {
    return createObject<types.TaskInsert>(data, "tasks");
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

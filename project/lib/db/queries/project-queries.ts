import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById, deleteObject, updateObject } from "./query_utils";
import * as schema from "@/lib/db/schema";

export const projects = {
  getAll: async (): Promise<types.QueryResponse<Array<types.ProjectSelect>>> => {
    return getAllObject<types.ProjectSelect>("projects");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    return getObjectById<types.ProjectSelect>(id, "projects");
  },
  create: async (data: types.ProjectInsert): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const newProject = data;
      const [insertedProject] = await db.insert(schema.projects).values(newProject).returning();
      // Check if operation is successful
      if (insertedProject) {
        return {
          success: true,
          message: `Successfully created new project ${insertedProject.name}`,
          data: insertedProject,
        };
      }
      throw new Error(`Error: Database did not return a result. Check database connection.`);
    } catch (e) {
      return {
        success: false,
        message: `Unable to create the project.`,
        error: e,
      };
    }
  },
  update: async (id: number, data: types.ProjectInsert): Promise<types.QueryResponse<types.ProjectInsert>> => {
    return updateObject<types.ProjectSelect, types.ProjectInsert>(
      id,
      data,
      "projects",
      projects.getById,
      (existing, incoming) => {
        const changed: Partial<types.ProjectInsert> = {};
        if (existing.name !== incoming.name) changed.name = incoming.name;
        if (existing.status !== incoming.status) changed.status = incoming.status;
        if (existing.ownerId !== incoming.ownerId) changed.ownerId = incoming.ownerId;
        if (existing.description !== incoming.description) changed.description = incoming.description;
        if (existing.dueDate !== incoming.dueDate) changed.dueDate = incoming.dueDate;
        return changed;
      },
      (existing) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...base } = existing;
        return base;
      },
    );
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    // Call Generic function to delete object
    return deleteObject<types.ProjectSelect>(id, "projects");
  },
};

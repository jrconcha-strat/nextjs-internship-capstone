import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById, deleteObject, updateObject } from "./query_utils";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { teams as teamsQuery } from "@/lib/db/queries/teams-queries";

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
  checkProjectNameUnique: async (project_name: string): Promise<types.QueryResponse<boolean>> => {
    try {
      // Check if the team name is unique.
      const result = await db.select().from(schema.projects).where(eq(schema.projects.name, project_name));

      // Return appropriate response based on the result length
      const isUnique = result.length === 0;
      const message = isUnique
        ? "There exists no project with this name. You are free to use this name."
        : "There exists a project with this name. Please choose another name.";

      return {
        success: true,
        message,
        data: isUnique,
      };
    } catch (e) {
      // Attempt to check uniqueness fails.
      return {
        success: false,
        message: "Unable to check if project name is unique.",
        error: e,
      };
    }
  },
  getAllMembersForProject: async (project_id: number): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.team_id, schema.teams.id))
        .where(eq(schema.teams_to_projects.project_id, project_id));

      // Extract the teams
      const teams = result.map((row) => row.teams);

      const memberTeams = await teams.reduce(
        async (accPromise, cv) => {
          const acc = await accPromise;

          const teamMembers = await teamsQuery.getAllTeamMembers(cv.id);

          if (!teamMembers.success) {
            throw new Error("Unable to get members of teams");
          }
          acc.push(...teamMembers.data);

          return acc;
        },
        Promise.resolve([] as types.UserSelect[]),
      );

      if (!memberTeams) {
        return {
          success: false,
          message: "Unable to retrieve the members of the project.",
          error: "No results returned.",
        };
      }

      return {
        success: true,
        message: "Successfully retrieved members of the project.",
        data: memberTeams,
      };
    } catch (e) {
      return {
        success: false,
        message: "Unable to retrieve the members of the project.",
        error: e,
      };
    }
  },
};

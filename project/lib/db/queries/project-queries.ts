import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById, deleteObject, getBaseFields } from "./query_utils";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { teams, teams as teamsQuery } from "@/lib/db/queries/teams-queries";

export const projects = {
  getAll: async (): Promise<types.QueryResponse<Array<types.ProjectSelect>>> => {
    return getAllObject<types.ProjectSelect>("projects");
  },
  getById: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    return getObjectById<types.ProjectSelect>(id, "projects");
  },
  create: async (data: types.ProjectInsert, teamIds: number[]): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const newProject = data;
      const now = new Date();

      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.ProjectSelect>> => {
        // Insert project
        const [insertedProject] = await tx.insert(schema.projects).values(newProject).returning();
        if (!insertedProject) {
          throw new Error(`Database did not return a project. Check connection.`);
        }

        // Create an entry to insert for each team
        const teamsToAssign: types.TeamsToProjectsInsert[] = teamIds.map((id) => ({
          team_id: id,
          project_id: insertedProject.id,
          createdAt: now,
          updatedAt: now,
        }));

        // Assign the teams
        const assignedTeams = await tx.insert(schema.teams_to_projects).values(teamsToAssign).returning();
        if (assignedTeams.length !== teamIds.length) {
          throw new Error("Not all teams were assigned.");
        }

        // Create Project Members Entries
        for (const assignedTeam of assignedTeams) {
          // Get all team members of this team
          const res = await teams.getAllTeamMembers(assignedTeam.team_id);
          if (!res.success) throw new Error(res.message);

          // Create an entry to insert for each team member
          const teamMembers = res.data;
          const membersToAssign: types.ProjectMembersInsert[] = teamMembers.map((teamMember) => ({
            team_id: assignedTeam.team_id,
            project_id: insertedProject.id,
            user_id: teamMember.id,
            role: 1, // Default
            createdAt: now,
            updatedAt: now,
          }));

          // Assign the members of this team.
          const assignedMembers = await tx.insert(schema.project_members).values(membersToAssign).returning();
          if (assignedMembers.length !== teamMembers.length) {
            throw new Error("Not all members were assigned.");
          }
        }

        // Insert default columns
        const defaultColumns = ["To Do", "In Progress", "Done"];

        const listsToInsert: types.ListInsert[] = defaultColumns.map((name, idx) => ({
          name: name,
          projectId: insertedProject.id,
          position: idx + 1,
          createdAt: now,
          updatedAt: now,
        }));

        const insertedLists = await tx.insert(schema.lists).values(listsToInsert).returning();
        if (insertedLists.length !== defaultColumns.length) {
          throw new Error("Not all default columns were created.");
        }

        return {
          success: true,
          message: "Created project successfully.",
          data: insertedProject,
        };
      });

      // Check if the transaction is successful
      if (txResult.success) {
        return {
          success: true,
          message: `Successfully created new project.`,
          data: txResult.data,
        };
      }
      throw new Error("Project database creation transaction failed.");
    } catch (e) {
      return {
        success: false,
        message: `Unable to create the project.`,
        error: e,
      };
    }
  },
  update: async (
    project_id: number,
    incomingProject: types.ProjectInsert,
  ): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      // Retrieve existing object data. Check if object exists.
      const response = await projects.getById(project_id);
      if (response.success === false) {
        // Failed to retrieve, throw error.
        throw new Error(response.message);
      }

      // Determine which fields have changed.
      const existingProject = response.data;

      const changed: Partial<types.ProjectInsert> = {};
      if (existingProject.name !== incomingProject.name) changed.name = incomingProject.name;
      if (existingProject.status !== incomingProject.status) changed.status = incomingProject.status;
      if (existingProject.ownerId !== incomingProject.ownerId) changed.ownerId = incomingProject.ownerId;
      if (existingProject.description !== incomingProject.description)
        changed.description = incomingProject.description;
      if (existingProject.dueDate !== incomingProject.dueDate) changed.dueDate = incomingProject.dueDate;

      const finalUpdatedObjectData = {
        ...getBaseFields(existingProject),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) {
        return {
          success: true,
          message: `No changes detected for this project.`,
          data: existingProject,
        };
      }

      const [result] = await db
        .update(schema.projects)
        .set(finalUpdatedObjectData)
        .where(eq(schema.projects.id, project_id))
        .returning();

      // Check if update is successful.
      if (result) {
        return {
          success: true,
          message: `Updated project successfully.`,
          data: result,
        };
      } else {
        return {
          success: false,
          message: `Unable to update project.`,
          error: `Error: Database returned nothing. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to update project.`,
        error: e,
      };
    }
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
  getProjectsForUser: async (userId: number): Promise<types.QueryResponse<types.ProjectSelect[]>> => {
    try {
      // Join users To Teams and teams to Projects to retrieve projects of the user.
      const result = await db
        .select({ project: schema.projects })
        .from(schema.users_to_teams)
        .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.team_id, schema.users_to_teams.team_id))
        .innerJoin(schema.projects, eq(schema.projects.id, schema.teams_to_projects.project_id))
        .where(eq(schema.users_to_teams.user_id, userId));

      const userProjects = result.map((row) => row.project);

      if (!userProjects) {
        return {
          success: false,
          message: `Unable to retrieve user projects.`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }

      return {
        success: true,
        message: `Successfully retrieved user projects.`,
        data: userProjects,
      };
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve user projects.`,
        error: e,
      };
    }
  },
};

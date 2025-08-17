import * as types from "../../../types/index";
import { db } from "../db-index";
import { getAllObject, getObjectById, deleteObject, getBaseFields, successResponse, failResponse } from "./query_utils";
import * as schema from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { teams } from "@/lib/db/queries/teams-queries";

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
        if (!insertedProject) throw new Error(`Database did not return a project. Check connection.`);

        // Create an entry to insert for each team
        const teamsToAssign: types.TeamsToProjectsInsert[] = teamIds.map((id) => ({
          team_id: id,
          project_id: insertedProject.id,
          createdAt: now,
          updatedAt: now,
        }));

        // Assign the teams
        const assignedTeams = await tx.insert(schema.teams_to_projects).values(teamsToAssign).returning();
        if (assignedTeams.length !== teamIds.length) throw new Error("Not all teams were assigned.");

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
          if (assignedMembers.length !== teamMembers.length) throw new Error("Not all members were assigned.");
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
        if (insertedLists.length !== defaultColumns.length) throw new Error("Not all default columns were created.");

        return successResponse(`Created project successfully.`, insertedProject);
      });

      if (txResult.success) return successResponse(txResult.message, txResult.data);
      throw new Error("Project database creation transaction failed.");
    } catch (e) {
      return failResponse(`Unable to create the project.`, e);
    }
  },
  update: async (
    project_id: number,
    incomingProject: types.ProjectInsert,
  ): Promise<types.QueryResponse<types.ProjectSelect>> => {
    try {
      const response = await projects.getById(project_id);
      if (response.success === false) throw new Error(response.message);

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

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingProject);

      const [result] = await db
        .update(schema.projects)
        .set(finalUpdatedObjectData)
        .where(eq(schema.projects.id, project_id))
        .returning();

      // Check if update is successful.
      if (result) return successResponse(`Updated project successfully.`, result);
      else return failResponse(`Unable to update project.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update project.`, e);
    }
  },
  delete: async (id: number): Promise<types.QueryResponse<types.ProjectSelect>> => {
    return deleteObject<types.ProjectSelect>(id, "projects");
  },
  checkProjectNameUnique: async (project_name: string): Promise<types.QueryResponse<boolean>> => {
    try {
      const result = await db.select().from(schema.projects).where(eq(schema.projects.name, project_name));

      const isUnique = result.length === 0;
      const message = isUnique
        ? "There exists no project with this name. You are free to use this name."
        : "There exists a project with this name. Please choose another name.";

      return successResponse(message, isUnique);
    } catch (e) {
      return failResponse(`Unable to check if project name is unique.`, e);
    }
  },
  getAllMembersForProject: async (project_id: number): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(schema.project_members, eq(schema.project_members.team_id, schema.teams.id))
        .where(eq(schema.project_members.project_id, project_id));

      // Extract the teams
      const teamsForProject = result.map((row) => row.teams);

      // Deduplicate teams
      const uniqueTeamsId = Array.from(new Set(teamsForProject.map((t) => t.id)));
      const uniqueTeamsForProject = uniqueTeamsId
        .map((id) => teamsForProject.find((t) => t.id === id))
        .filter((t) => t !== undefined);

      const memberTeams = await uniqueTeamsForProject.reduce(
        async (accPromise, cv) => {
          const acc = await accPromise;

          const teamMembers = await teams.getAllTeamMembers(cv.id);

          if (!teamMembers.success) throw new Error("Unable to get members of teams");

          acc.push(...teamMembers.data);

          return acc;
        },
        Promise.resolve([] as types.UserSelect[]),
      );

      // Deduplicate members
      const uniqueMembersId = Array.from(new Set(memberTeams.map((t) => t.id)));
      const uniqueMembersForProject = uniqueMembersId
        .map((id) => memberTeams.find((m) => m.id === id))
        .filter((m) => m !== undefined);

      if (!uniqueMembersForProject)
        return failResponse(`Unable to retrieve the members of the project.`, `Database returned no results`);

      return successResponse("Successfully retrieved members of the project.", uniqueMembersForProject);
    } catch (e) {
      return failResponse(`Unable to retrieve the members of the project.`, e);
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

      // De-duplicate projects of user, necessary as a user can be assigned to multiple teams which may be assigned to the same project.
      // Retrieve unique project ids
      const userProjectsId = Array.from(new Set(userProjects.map((p) => p.id)));
      // Retrieve project objects with ids, undefined if not found.
      const uniqueProjectsWithUndefined = userProjectsId.map((id) => userProjects.find((project) => project.id === id));
      // Remove any undefineds
      const uniqueProjects = uniqueProjectsWithUndefined.filter((project) => project !== undefined);

      if (uniqueProjects === undefined)
        return failResponse(`Unable to retrieve user projects.`, `Database returned no result.`);

      return successResponse(`Successfully retrieved user projects.`, uniqueProjects);
    } catch (e) {
      return failResponse(`Unable to retrieve user projects.`, e);
    }
  },
};

import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { and, eq } from "drizzle-orm";
import { failResponse, getBaseFields, successResponse } from "./query_utils";

export const teams = {
  getById: async (teamId: number): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      const [team] = await db.select().from(schema.teams).limit(1).where(eq(schema.teams.id, teamId));

      if (team) return successResponse(`Team retrieved successfully.`, team);
      throw new Error(`Team not found.`);
    } catch (e) {
      return failResponse(`Unable to retrieve team.`, e);
    }
  },
  deleteTeam: async (teamId: number): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      const res = await teams.getById(teamId);
      if (res.success === false) throw new Error(res.message);

      const [result] = await db.delete(schema.teams).where(eq(schema.teams.id, teamId)).returning();

      if (result) return successResponse(`Team deleted successfully.`, result);
      else return failResponse(`Unable to delete team`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to delete team`, e);
    }
  },
  getTeamsForUser: async (userId: number): Promise<types.QueryResponse<types.TeamsSelect[]>> => {
    try {
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.team_id, schema.teams.id))
        .where(eq(schema.users_to_teams.user_id, userId));

      const teams = result.map((row) => row.teams);

      if (teams) return successResponse(`Successfully retrieved user's teams.`, teams);
      else return failResponse(`Unable to retrieve user's teams`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to retrieve user's teams`, e);
    }
  },
  updateTeam: async (teamId: number, incomingTeamData: types.TeamsInsert): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      const res = await teams.getById(teamId);
      if (!res.success) throw new Error(res.message);

      const existingTeamData = res.data;

      const changed: Partial<types.TeamsInsert> = {};

      if (existingTeamData.teamName !== incomingTeamData.teamName) changed.teamName = incomingTeamData.teamName;

      const finalUpdatedTeamData = {
        ...getBaseFields(existingTeamData),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) return successResponse(`No changes detected.`, existingTeamData);

      const [result] = await db
        .update(schema.teams)
        .set(finalUpdatedTeamData)
        .where(eq(schema.teams.id, teamId))
        .returning();

      if (result) return successResponse(`Updated team successfully.`, existingTeamData);
      else return failResponse(`Unable to update team.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to update team.`, e);
    }
  },
  createTeam: async (teamObject: types.TeamsInsert): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      const [team] = await db.insert(schema.teams).values(teamObject).returning();

      if (team) return successResponse(`Created team successfully`, team);
      else return failResponse(`Unable to create team.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to create team.`, e);
    }
  },
  addUserToTeam: async (
    userId: number,
    teamId: number,
    isLeader: boolean,
  ): Promise<types.QueryResponse<types.UsersToTeamsInsert>> => {
    try {
      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.UsersToTeamsInsert>> => {
        // Construct the users to teams object to be inserted
        const usersToTeamsObject: types.UsersToTeamsInsert = {
          team_id: teamId,
          user_id: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isLeader: isLeader,
        };
        const usersToTeamsEntry = await tx.insert(schema.users_to_teams).values(usersToTeamsObject).returning();
        if (!usersToTeamsEntry) throw new Error("Unable to create users to teams entry.");

        // Create a project member entry for all assigned projects of the team.
        const res = await teams.getProjectsForTeam(teamId);
        if (!res.success) throw new Error(res.message);

        const projectsOfTeam = res.data;
        const now = new Date();

        for (const project of projectsOfTeam) {
          // Construct a project member entry for this project
          const memberToAssign: types.ProjectMembersInsert = {
            team_id: teamId,
            project_id: project.id,
            user_id: userId,
            role: 1,
            createdAt: now,
            updatedAt: now,
          };

          // Assign this team member to the project.
          const assignedMember = await tx.insert(schema.project_members).values(memberToAssign).returning();
          if (!assignedMember) throw new Error(`Unable to assign user as member of project ${project.name}.`);
        }
        return successResponse(`Successfully added user ${userId} to team ${teamId}`, usersToTeamsObject);
      });

      if (txResult.success) return successResponse(`Successfully added user to the team.`, txResult.data);
      return failResponse(`Unable to add user to the team`, `Adding user to team database transaction failed`);
    } catch (e) {
      return failResponse(`Unable to add user to the team`, e);
    }
  },
  removeUserFromTeam: async (
    userId: number,
    teamId: number,
  ): Promise<types.QueryResponse<types.UsersToTeamsSelect>> => {
    try {
      const txResult = await db.transaction(async (tx): Promise<types.QueryResponse<types.UsersToTeamsSelect>> => {
        // Remove users to team entries.
        const [response] = await tx
          .delete(schema.users_to_teams)
          .where(and(eq(schema.users_to_teams.user_id, userId), eq(schema.users_to_teams.team_id, teamId)))
          .returning();

        if (!response) throw new Error("Unable to delete users to teams entry.");

        // Remove user's project member entries for all assigned projects of the team.
        const res = await teams.getProjectsForTeam(teamId);
        if (!res.success) throw new Error(res.message);

        const projectsOfTeam = res.data;

        for (const project of projectsOfTeam) {
          // Remove this user from the project
          const removedMember = await tx
            .delete(schema.project_members)
            .where(
              and(
                eq(schema.project_members.user_id, userId),
                eq(schema.project_members.team_id, teamId),
                eq(schema.project_members.project_id, project.id),
              ),
            )
            .returning();
          if (!removedMember) throw new Error(`Unable to remove user as member of project ${project.name}.`);
        }
        return successResponse(`Successfully removed user ${userId} from team ${teamId}`, response);
      });

      // Check if the transaction is successful
      if (txResult.success) return successResponse(`Successfully removed user from the team.`, txResult.data);
      return failResponse(`Unable to remove user from the team`, `Removing user to team database transaction failed`);
    } catch (e) {
      return failResponse(`Unable to remove user from the team`, e);
    }
  },

  getAllTeamMembers: async (team_id: number): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      // SQL that retrieves all the members of a team.
      const result = await db
        .select()
        .from(schema.users)
        .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.user_id, schema.users.id))
        .where(eq(schema.users_to_teams.team_id, team_id));

      // Extract the users of the teams
      const users = result.map((row) => row.users);

      if (users) return successResponse(`Successfully retrieved team members.`, users);
      else return failResponse(`Unable to retrieve team members.`, `Database returned no result.`);
    } catch (e) {
      return failResponse(`Unable to retrieve team members.`, e);
    }
  },
  checkTeamNameUnique: async (team_name: string): Promise<types.QueryResponse<boolean>> => {
    try {
      // Check if the team name is unique.
      const result = await db.select().from(schema.teams).where(eq(schema.teams.teamName, team_name));

      // Return appropriate response based on the result length
      const isUnique = result.length === 0;
      const message = isUnique
        ? "There exists no team with this name. You are free to use this name."
        : "There exists a team with this name. Please choose another name.";

      return successResponse(message, isUnique);
    } catch (e) {
      return failResponse(`Unable to check team name uniqueness.`, e);
    }
  },
  checkUserIsLeader: async (user_id: number, team_id: number): Promise<types.QueryResponse<boolean>> => {
    try {
      const result = await db
        .select({ isLeader: schema.users_to_teams.isLeader })
        .from(schema.users_to_teams)
        .where(
          and(
            eq(schema.users_to_teams.user_id, user_id),
            eq(schema.users_to_teams.team_id, team_id),
            eq(schema.users_to_teams.isLeader, true),
          ),
        )
        .limit(1);
      if (!result) throw new Error("Unable to find a user to team entry with the user and team id given.");

      const isLeader = result.length === 1;
      const message = isLeader ? "User is team leader." : "User is a team member";

      return successResponse(message, isLeader);
    } catch (e) {
      return failResponse(`Unable to check if user is team leader.`, e);
    }
  },
  getTeamLeader: async (team_id: number): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const result = await db
        .select({ users: schema.users })
        .from(schema.users)
        .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.user_id, schema.users.id))
        .where(and(eq(schema.users_to_teams.team_id, team_id), eq(schema.users_to_teams.isLeader, true)))
        .limit(1);

      // Retrieve team Leader
      const [teamLeaderUser] = result.map((entry) => entry.users);

      if (!teamLeaderUser) throw new Error("Unable to retrieve team leader for that team.");

      return successResponse(`Successfully retrieved team leader.`, teamLeaderUser);
    } catch (e) {
      return failResponse(`Unable to retrieve team leader.`, e);
    }
  },
  reassignTeamLeader: async (
    old_leader_id: number,
    new_leader_id: number,
    team_id: number,
  ): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      const txResult = await db.transaction(async (trx) => {
        // This sets old leader (userToTeams entry) flag to false.
        const [demoted] = await trx
          .update(schema.users_to_teams)
          .set({ isLeader: false })
          .where(
            and(
              eq(schema.users_to_teams.team_id, team_id),
              eq(schema.users_to_teams.user_id, old_leader_id),
              eq(schema.users_to_teams.isLeader, true),
            ),
          )
          .returning();

        if (!demoted) throw new Error("Failed to set old leader's isLeader flag to false.");

        // This sets new leader (userToTeams entry) flag to true
        const [promoted] = await trx
          .update(schema.users_to_teams)
          .set({ isLeader: true })
          .where(
            and(
              eq(schema.users_to_teams.team_id, team_id),
              eq(schema.users_to_teams.user_id, new_leader_id),
              eq(schema.users_to_teams.isLeader, false),
            ),
          )
          .returning();

        if (!promoted) throw new Error("Failed to set new leader's isLeader flag to true.");

        return successResponse(`Successfully reassigned team leader.`, promoted);
      });

      // Return the new leader's info
      const [newLeaderUser] = await db.select().from(schema.users).where(eq(schema.users.id, new_leader_id)).limit(1);

      if (!newLeaderUser) throw new Error("Unable to fetch new leader user.");

      if (txResult.success) return successResponse(`Successfully reassigned team leader.`, newLeaderUser);
      return failResponse(`Unable to reassign team leader.`, `Reassignment of team leader database transaction failed`);
    } catch (e) {
      return failResponse(`Unable to reassign team leader`, e);
    }
  },
  getProjectsForTeam: async (team_id: number): Promise<types.QueryResponse<types.ProjectSelect[]>> => {
    try {
      const result = await db
        .select({ project: schema.projects })
        .from(schema.projects)
        .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.project_id, schema.projects.id))
        .where(eq(schema.teams_to_projects.team_id, team_id));

      if (result.length === 0) return successResponse(`Team has no assigned projects.`, []);

      // Unwrapping
      const projects = result.map((r) => r.project);

      return successResponse(`Successfully retrieved team's projects`, projects);
    } catch (e) {
      return failResponse(`Unable to retrieve team's projects`, e);
    }
  },
};

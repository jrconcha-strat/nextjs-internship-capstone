import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

export const teams = {
  getTeamsForUser: async (
    userId: number,
  ): Promise<types.QueryResponse<types.TeamsSelect[]>> => {
    try {
      // SQL that retrieves the user's teams with their usertoTeamEntries using their id.
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(
          schema.users_to_teams,
          eq(schema.users_to_teams.team_id, schema.teams.id),
        )
        .where(eq(schema.users_to_teams.user_id, userId));

      // Extract the teams of the user
      const teams = result.map((row) => row.teams);

      if (teams) {
        return {
          success: true,
          message: `Successfully retrieved user teams.`,
          data: teams,
        };
      } else {
        return {
          success: false,
          message: `Unable to retrieve user teams.`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve user teams.`,
        error: e,
      };
    }
  },
  createTeam: async (
    teamName: string,
  ): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      // Construct the team object to be inserted
      const teamObject: types.TeamsInsert = {
        teamName,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      };

      const [response] = await db
        .insert(schema.teams)
        .values(teamObject)
        .returning();

      if (response) {
        return {
          success: true,
          message: `Successfully created team ${teamName}.`,
          data: response,
        };
      } else {
        return {
          success: false,
          message: `Unable to create team ${teamName}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to create team ${teamName}.`,
        error: e,
      };
    }
  },
  addUserToTeam: async (
    userId: number,
    teamId: number,
    isCreator: boolean,
  ): Promise<types.QueryResponse<types.UsersToTeamsInsert>> => {
    try {
      // Construct the users to teams object to be inserted
      const usersToTeamsObject: types.UsersToTeamsInsert = {
        team_id: teamId,
        user_id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        role: 1,
        isCreator: isCreator,
      };

      const response = await db
        .insert(schema.users_to_teams)
        .values(usersToTeamsObject);
      if (response.rowCount === 1) {
        return {
          success: true,
          message: `Successfully added user ${userId} to team ${teamId}.`,
          data: usersToTeamsObject,
        };
      } else {
        return {
          success: false,
          message: `Unable to add user ${userId} to team ${teamId}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to add user ${userId} to team ${teamId}`,
        error: e,
      };
    }
  },

  getAllTeamMembers: async (
    team_id: number,
  ): Promise<types.QueryResponse<types.UserSelect[]>> => {
    try {
      // SQL that retrieves all the members of a team.
      const result = await db
        .select()
        .from(schema.users)
        .innerJoin(
          schema.users_to_teams,
          eq(schema.users_to_teams.user_id, schema.users.id),
        )
        .where(eq(schema.users_to_teams.team_id, team_id));

      // Extract the users of the teams
      const users = result.map((row) => row.users);

      if (users) {
        return {
          success: true,
          message: `Successfully retrieved team's members.`,
          data: users,
        };
      } else {
        return {
          success: false,
          message: `Unable to retrieve team's members`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve team's members.`,
        error: e,
      };
    }
  },
};

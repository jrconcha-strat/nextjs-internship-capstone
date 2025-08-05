import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";

export const teams = {
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

  getAllMembers: async () => {},
};

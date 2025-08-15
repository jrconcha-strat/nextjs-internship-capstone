import * as types from "../../../types/index";
import { db } from "../db-index";
import * as schema from "../schema";
import { and, eq } from "drizzle-orm";
import { getBaseFields } from "./query_utils";

export const teams = {
  getById: async (teamId: number): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      const [team] = await db.select().from(schema.teams).limit(1).where(eq(schema.teams.id, teamId));

      // Check if team exists.
      if (team) {
        return {
          success: true,
          message: `Team retrieved using id: ${teamId}.`,
          data: team,
        };
      }
      throw new Error(`Team does not exist.`);
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve team using id: ${teamId}.`,
        error: e,
      };
    }
  },
  deleteTeam: async (teamId: number): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      // Check if the team exists
      const response = await teams.getById(teamId);
      if (response.success === false) {
        // Failed to retrieve, throw error.
        throw new Error(response.message);
      }

      // Retrieve the data of the team to be deleted
      const existingTeamData = response.data;

      const result = await db.delete(schema.teams).where(eq(schema.teams.id, teamId));

      if (result.rowCount === 1) {
        return {
          success: true,
          message: `Successfully deleted team ${existingTeamData.teamName}.`,
          data: existingTeamData,
        };
      } else {
        return {
          success: false,
          message: `Unable to delete team ${existingTeamData.teamName}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: `Unable to delete team with id: ${teamId}.`,
        error: e,
      };
    }
  },
  getTeamsForUser: async (userId: number): Promise<types.QueryResponse<types.TeamsSelect[]>> => {
    try {
      // SQL that retrieves the user's teams with their usertoTeamEntries using their id.
      const result = await db
        .select()
        .from(schema.teams)
        .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.team_id, schema.teams.id))
        .where(eq(schema.users_to_teams.user_id, userId));

      // Extract the teams of the user
      const teams = result.map((row) => row.teams);

      if (teams) {
        return {
          success: true,
          message: `Successfully retrieved user teams of ${userId}.`,
          data: teams,
        };
      } else {
        return {
          success: false,
          message: `Unable to retrieve user teams of ${userId}.`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve user teams of ${userId} .`,
        error: e,
      };
    }
  },
  updateTeam: async (teamId: number, newTeamName: string): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      // Retrieve existing team data. Check if team exists.
      const response = await teams.getById(teamId);
      if (response.success === false) {
        // Failed to retrieve, throw error.
        throw new Error(response.message);
      }

      // Determine which fields have changed.
      const existingTeamData = response.data;

      const changed: Partial<types.TeamsInsert> = {};

      if (existingTeamData.teamName !== newTeamName) changed.teamName = newTeamName;

      const finalUpdatedTeamData = {
        ...getBaseFields(existingTeamData),
        ...changed,
        ...(Object.keys(changed).length > 0 ? { updatedAt: new Date() } : {}),
      };

      if (Object.keys(changed).length === 0) {
        return {
          success: true,
          message: `No changes detected for this team..`,
          data: existingTeamData,
        };
      }

      const [result] = await db
        .update(schema.teams)
        .set(finalUpdatedTeamData)
        .where(eq(schema.teams.id, teamId))
        .returning();

      // Check if update is successful.
      if (result) {
        return {
          success: true,
          message: `Updated team successfully.`,
          data: existingTeamData,
        };
      } else {
        return {
          success: false,
          message: `Unable to update team.`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to update team`,
        error: e,
      };
    }
  },
  createTeam: async (teamName: string): Promise<types.QueryResponse<types.TeamsSelect>> => {
    try {
      // Construct the team object to be inserted
      const teamObject: types.TeamsInsert = {
        teamName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [response] = await db.insert(schema.teams).values(teamObject).returning();

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
        if (!usersToTeamsEntry) {
          throw new Error("Unable to create users to teams entry.");
        }

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
          if (!assignedMember) {
            throw new Error(`Unable to assign user as member of project ${project.name}.`);
          }
        }
        return {
          success: true,
          message: `Successfully added user ${userId} to team ${teamId}.`,
          data: usersToTeamsObject,
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
      throw new Error("Adding user to team database creation transaction failed.");
    } catch (e) {
      return {
        success: false,
        message: `Unable to add user ${userId} to team ${teamId}`,
        error: e,
      };
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

        if (!response) {
          throw new Error("Unable to delete users to teams entry.");
        }

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
          if (!removedMember) {
            throw new Error(`Unable to remove user as member of project ${project.name}.`);
          }
        }
        return {
          success: true,
          message: `Successfully removed user ${userId} from team ${teamId}.`,
          data: response,
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
      throw new Error("Removing user from team database creation transaction failed.");
    } catch (e) {
      return {
        success: false,
        message: `Unable to add user ${userId} to team ${teamId}`,
        error: e,
      };
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

      if (users) {
        return {
          success: true,
          message: `Successfully retrieved team members of ${team_id}.`,
          data: users,
        };
      } else {
        return {
          success: false,
          message: `Unable to retrieve team members of ${team_id}`,
          error: `Error: response.rowCount returned 0 rows modified. Check database connection.`,
        };
      }
    } catch (e) {
      return {
        success: false,
        message: `Unable to retrieve team members of ${team_id}.`,
        error: e,
      };
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

      return {
        success: true,
        message,
        data: isUnique,
      };
    } catch (e) {
      // Attempt to check uniqueness fails.
      return {
        success: false,
        message: "Unable to check if team name is unique.",
        error: e,
      };
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
      if (!result) {
        throw new Error("Unable to find user to teams row of user id.");
      }
      const isLeader = result.length === 1;
      const message = isLeader ? "User is team leader." : "User is a team member";

      return {
        success: true,
        message,
        data: isLeader,
      };
    } catch (e) {
      return {
        success: false,
        message: "Unable to check if user is team leader.",
        error: e,
      };
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

      if (!teamLeaderUser) {
        throw new Error("Unable to retrieve team leader for that team.");
      }

      return {
        success: true,
        message: "Successfully retrieved team leader of that team.",
        data: teamLeaderUser,
      };
    } catch (e) {
      return {
        success: false,
        message: "Unable to retrieve team leader for that team.",
        error: e,
      };
    }
  },
  reassignTeamLeader: async (
    old_leader_id: number,
    new_leader_id: number,
    team_id: number,
  ): Promise<types.QueryResponse<types.UserSelect>> => {
    try {
      await db.transaction(async (trx) => {
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

        if (!demoted) {
          throw new Error("Failed to set old leader's isLeader flag to false.");
        }

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

        if (!promoted) {
          throw new Error("Failed to set new leader's isLeader flag to true.");
        }
      });

      // Return the new leader's info
      const [newLeaderUser] = await db.select().from(schema.users).where(eq(schema.users.id, new_leader_id)).limit(1);

      if (!newLeaderUser) {
        throw new Error("Unable to fetch new leader user.");
      }

      return {
        success: true,
        message: "Successfully reassigned team leader.",
        data: newLeaderUser,
      };
    } catch (e) {
      return {
        success: false,
        message: "Unable to reassign team leader.",
        error: e,
      };
    }
  },
  getProjectsForTeam: async (team_id: number): Promise<types.QueryResponse<types.ProjectSelect[]>> => {
    try {
      const result = await db
        .select({ project: schema.projects })
        .from(schema.projects)
        .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.project_id, schema.projects.id))
        .where(eq(schema.teams_to_projects.team_id, team_id));

      if (result.length === 0) {
        return {
          success: true,
          message: "Team has no assigned projects.",
          data: [],
        };
      }

      // Unwrapping
      const projects = result.map((r) => r.project);

      return {
        success: true,
        message: "Successfully retrieved team's projects",
        data: projects,
      };
    } catch (e) {
      return {
        success: false,
        message: "Unable to retrieve team's projects",
        error: e,
      };
    }
  },
};

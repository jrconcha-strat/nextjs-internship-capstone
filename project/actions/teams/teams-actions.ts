"use server";

import { queries } from "@/lib/db/queries/queries";
import { revalidatePath } from "next/cache";
import * as types from "../../types/index";
import { ServerActionResponse } from "../actions-types";

export async function updateTeam(
  team_id: number,
  newTeamName: string,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  const updateTeamResponse = await queries.teams.updateTeam(team_id, newTeamName);

  revalidatePath("/teams");

  return updateTeamResponse.success ? updateTeamResponse : updateTeamResponse;
}

export async function checkTeamNameUnique(teamName: string): Promise<ServerActionResponse<boolean>> {
  // call utility function to check teamname uniqueness.
  const nameIsUniqueResponse = await queries.teams.checkTeamNameUnique(teamName);

  // Ternary to narrow the response type.
  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

export async function deleteTeam(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  // call utility function to delete team.
  const deleteTeamResponse = await queries.teams.deleteTeam(team_id);

  // Revalidation to purge stale data from teams page.
  revalidatePath("/teams");

  // Ternary to narrow the response type.
  return deleteTeamResponse.success ? deleteTeamResponse : deleteTeamResponse;
}

export async function addUsersToTeam(users_ids: number[], team_id: number): Promise<ServerActionResponse<boolean>> {
  for (const user_id of users_ids) {
    // Add current user to team
    const addUsertoTeamResponse = await queries.teams.addUserToTeam(user_id, team_id, false);
    if (!addUsertoTeamResponse.success) {
      return addUsertoTeamResponse;
    }
  }
  revalidatePath("/teams");
  // Return success response
  return {
    success: true,
    message: "Successfully added users as members.",
    data: true,
  };
}

export async function removeUsersFromTeam(users_ids: number[], team_id: number): Promise<ServerActionResponse<boolean>> {
  for (const user_id of users_ids) {
    // remove current user from team
    const removeUserFromTeamResponse = await queries.teams.removeUserFromTeam(user_id, team_id);
    if (!removeUserFromTeamResponse.success) {
      return removeUserFromTeamResponse;
    }
  }
  revalidatePath("/teams");
  // Return success response
  return {
    success: true,
    message: "Successfully removed users as members.",
    data: true,
  };
}

export async function getUsersForTeam(team_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  const teamId = team_id;
  try {
    const response = await queries.teams.getAllTeamMembers(teamId);
    if (!response.success) {
      return response;
    }

    return {
      success: true,
      message: `Successfully retrieved team members for ${teamId}`,
      data: response.data,
    };
  } catch (e) {
    return {
      success: false,
      message: `Unable to retrieve members for ${teamId}`,
      error: e,
    };
  }
}

export async function getTeamsForUser(user_id: number): Promise<ServerActionResponse<types.TeamsSelect[]>> {
  const userId = user_id;

  // Retrieve teams of user.
  const response = await queries.teams.getTeamsForUser(userId);

  if (!response.success) {
    return { ...response };
  }

  // Return success response
  return { ...response };
}

export async function createTeam(
  teamName: string,
  currentUserClerkId: string,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  // Get current user by Clerk ID
  const getByClerkIdResponse = await queries.users.getByClerkId(currentUserClerkId);

  if (!getByClerkIdResponse.success) {
    return {
      success: false,
      message: "Team Creation: Unable to get current user.",
      error: getByClerkIdResponse.error,
    };
  }

  // Create team
  const teamCreationResponse = await queries.teams.createTeam(teamName);
  if (!teamCreationResponse.success) {
    return {
      success: false,
      message: "Team Creation: Unable to create team.",
      error: teamCreationResponse.error,
    };
  }

  // Add current user to team
  const addUsertoTeamResponse = await queries.teams.addUserToTeam(
    getByClerkIdResponse.data.id,
    teamCreationResponse.data.id,
    true,
  );
  if (!addUsertoTeamResponse.success) {
    return {
      success: false,
      message: "Team Creation: Unable to add current user to team.",
      error: addUsertoTeamResponse.error,
    };
  }

  revalidatePath("/teams");

  // Return success response
  return {
    success: true,
    message: "Team Creation: Team creation successful and added current user as member.",
    data: teamCreationResponse.data,
  };
}

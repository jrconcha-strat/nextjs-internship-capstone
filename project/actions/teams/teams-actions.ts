"use server";

import { queries } from "@/lib/db/queries/queries";
import {
  GetTeamsResponse,
  CreateTeamResponse,
  GetUsersForTeamResponse,
  DeleteTeamResponse,
  CheckTeamNameUniquenessResponse,
} from "./teams-types";
import { revalidatePath } from "next/cache";

export async function checkTeamNameUnique(
  teamName: string,
): Promise<CheckTeamNameUniquenessResponse> {
  // call utility function to check teamname uniqueness.
  const nameIsUniqueResponse =
    await queries.teams.checkTeamNameUnique(teamName);

  // Ternary to narrow the response type.
  return nameIsUniqueResponse.success
    ? nameIsUniqueResponse
    : nameIsUniqueResponse;
}

export async function deleteTeam(team_id: number): Promise<DeleteTeamResponse> {
  const response = await queries.teams.deleteTeam(team_id);
  if (!response.success) {
    return response;
  }

  revalidatePath("/teams");
  return response;
}

export async function getUsersForTeam(
  team_id: number,
): Promise<GetUsersForTeamResponse> {
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

export async function getTeamsForUser(
  user_id: number,
): Promise<GetTeamsResponse> {
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
): Promise<CreateTeamResponse> {
  // Get current user by Clerk ID
  const getByClerkIdResponse =
    await queries.users.getByClerkId(currentUserClerkId);

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
    message:
      "Team Creation: Team creation successful and added current user as member.",
    data: teamCreationResponse.data,
  };
}

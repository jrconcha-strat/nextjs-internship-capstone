"use server";

import { queries } from "@/lib/db/queries/queries";
import { CreateTeamResponse } from "./teams-types";

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

  // Return success response
  return {
    success: true,
    message:
      "Team Creation: Team creation successful and added current user as member.",
    data: teamCreationResponse.data,
  };
}

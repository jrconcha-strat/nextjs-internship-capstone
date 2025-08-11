"use server";

import { queries } from "@/lib/db/queries/queries";
import { revalidatePath } from "next/cache";
import * as types from "../types/index";
import { ServerActionResponse } from "./actions-types";
import { teamSchemaForm } from "@/lib/validations/validations";
import z from "zod";

export async function updateTeamAction(
  team_id: number,
  newData: z.infer<typeof teamSchemaForm>,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  const updateTeamResponse = await queries.teams.updateTeam(team_id, newData.teamName);

  revalidatePath("/teams");

  return updateTeamResponse.success ? updateTeamResponse : updateTeamResponse;
}

export async function reassignTeamLeaderAction(
  old_leader_id: number,
  new_leader_id: number,
  team_id: number,
): Promise<ServerActionResponse<types.UserSelect>> {
  const reassignTeamLeaderResponse = await queries.teams.reassignTeamLeader(old_leader_id, new_leader_id, team_id);

  return reassignTeamLeaderResponse.success ? reassignTeamLeaderResponse : reassignTeamLeaderResponse;
}

export async function getTeamLeaderAction(team_id: number): Promise<ServerActionResponse<types.UserSelect>> {
  const getTeamLeaderResponse = await queries.teams.getTeamLeader(team_id);

  return getTeamLeaderResponse.success ? getTeamLeaderResponse : getTeamLeaderResponse;
}

export async function checkUserIsLeaderAction(
  user_id: number,
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  const userIsLeaderResponse = await queries.teams.checkUserIsLeader(user_id, team_id);

  return userIsLeaderResponse.success ? userIsLeaderResponse : userIsLeaderResponse;
}

export async function checkTeamNameUnique(teamName: string): Promise<ServerActionResponse<boolean>> {
  // call utility function to check teamname uniqueness.
  const nameIsUniqueResponse = await queries.teams.checkTeamNameUnique(teamName);

  // Ternary to narrow the response type.
  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

export async function deleteTeamAction(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  // call utility function to delete team.
  const deleteTeamResponse = await queries.teams.deleteTeam(team_id);

  // Revalidation to purge stale data from teams page.
  revalidatePath("/teams");

  // Ternary to narrow the response type.
  return deleteTeamResponse.success ? deleteTeamResponse : deleteTeamResponse;
}

export async function addUsersToTeamAction(
  users_ids: number[],
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
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

export async function removeUsersFromTeamAction(
  users_ids: number[],
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
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
  const getUsersForTeamResponse = await queries.teams.getAllTeamMembers(team_id);

  return getUsersForTeamResponse.success ? getUsersForTeamResponse : getUsersForTeamResponse;
}

export async function getTeamsForUser(user_id: number): Promise<ServerActionResponse<types.TeamsSelect[]>> {
  // Retrieve teams of user.
  const getTeamsForUserResponse = await queries.teams.getTeamsForUser(user_id);
  return getTeamsForUserResponse.success ? getTeamsForUserResponse : getTeamsForUserResponse;
}

export async function createTeam(
  teamName: string,
  currentUserClerkId: string,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  // Get current user by Clerk ID
  const getByClerkIdResponse = await queries.users.getByClerkId(currentUserClerkId);

  if (!getByClerkIdResponse.success) {
    return getByClerkIdResponse;
  }

  // Create team
  const teamCreationResponse = await queries.teams.createTeam(teamName);
  if (!teamCreationResponse.success) {
    return teamCreationResponse;
  }

  // Add current user to team
  const addUsertoTeamResponse = await queries.teams.addUserToTeam(
    getByClerkIdResponse.data.id,
    teamCreationResponse.data.id,
    true,
  );
  if (!addUsertoTeamResponse.success) {
    return addUsertoTeamResponse;
  }

  revalidatePath("/teams");

  // Return success response
  return {
    success: true,
    message: "Team creation success! Invite people to your team!",
    data: teamCreationResponse.data,
  };
}

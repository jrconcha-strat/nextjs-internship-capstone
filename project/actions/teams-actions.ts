"use server";

import { queries } from "@/lib/db/queries/queries";
import * as types from "../types/index";
import { ServerActionResponse } from "./actions-types";
import {
  addUsersToTeamSchema,
  assignTeamLeaderSchema,
  deleteTeamSchema,
  removeUsersFromTeamSchema,
  teamSchemaDB,
  teamSchemaForm,
} from "@/lib/validations/validations";
import z from "zod";
import { getUserId } from "./user-actions";
import { checkAuthenticationStatus } from "./actions-utils";
import { failResponse, successResponse } from "@/lib/db/queries/query_utils";

// Utilities
export async function checkUserIsLeaderAction(
  user_id: number,
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();
  const userIsLeaderResponse = await queries.teams.checkUserIsLeader(user_id, team_id);

  return userIsLeaderResponse.success ? userIsLeaderResponse : userIsLeaderResponse;
}

export async function checkTeamNameUnique(teamName: string): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();
  const nameIsUniqueResponse = await queries.teams.checkTeamNameUnique(teamName);

  return nameIsUniqueResponse.success ? nameIsUniqueResponse : nameIsUniqueResponse;
}

// Fetches
export async function getTeamByIdAction(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();
  return await queries.teams.getById(team_id);
}

export async function getTeamLeaderAction(team_id: number): Promise<ServerActionResponse<types.UserSelect>> {
  await checkAuthenticationStatus();
  return await queries.teams.getTeamLeader(team_id);
}

export async function getProjectsForTeamAction(team_id: number): Promise<ServerActionResponse<types.ProjectSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.teams.getProjectsForTeam(team_id);
}

export async function getUsersForTeam(team_id: number): Promise<ServerActionResponse<types.UserSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.teams.getAllTeamMembers(team_id);
}

export async function getTeamsForUser(user_id: number): Promise<ServerActionResponse<types.TeamsSelect[]>> {
  await checkAuthenticationStatus();
  return await queries.teams.getTeamsForUser(user_id);
}

// Mutations
export async function updateTeamAction(
  team_id: number,
  newData: z.infer<typeof teamSchemaForm>,
): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const res = await queries.teams.getById(team_id);
  if (!res.success) return res;

  const teamDBData: z.infer<typeof teamSchemaDB> = {
    ...res.data,
    ...newData,
  };

  const parsed = teamSchemaDB.safeParse(teamDBData);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.updateTeam(team_id, teamDBData);
}

export async function reassignTeamLeaderAction(
  old_leader_id: number,
  new_leader_id: number,
  team_id: number,
): Promise<ServerActionResponse<types.UserSelect>> {
  await checkAuthenticationStatus();

  const parsed = assignTeamLeaderSchema.safeParse({ old_leader_id, new_leader_id, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.reassignTeamLeader(old_leader_id, new_leader_id, team_id);
}

export async function deleteTeamAction(team_id: number): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const parsed = deleteTeamSchema.safeParse({ team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  return await queries.teams.deleteTeam(team_id);
}

export async function addUsersToTeamAction(
  users_ids: number[],
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();

  const parsed = addUsersToTeamSchema.safeParse({ users_ids, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  for (const user_id of users_ids) {
    const res = await queries.teams.addUserToTeam(user_id, team_id, false);
    if (!res.success) return res;
  }

  return successResponse("Successfully added users as members", true);
}

export async function removeUserFromTeamAction(
  user_id: number,
  team_id: number,
): Promise<ServerActionResponse<boolean>> {
  await checkAuthenticationStatus();

  const parsed = removeUsersFromTeamSchema.safeParse({ user_id, team_id });
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const res = await queries.teams.removeUserFromTeam(user_id, team_id);
  if (!res.success) return res;

  return successResponse("Successfully removed users as members", true);
}

export async function createTeamAction(teamName: string): Promise<ServerActionResponse<types.TeamsSelect>> {
  await checkAuthenticationStatus();

  const user = await getUserId();
  if (!user.success) return user;

  const teamObject: types.TeamsInsert = {
    teamName,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parsed = teamSchemaDB.safeParse(teamObject);
  if (!parsed.success) return failResponse(`Zod Validation Error`, z.flattenError(parsed.error));

  const createResponse = await queries.teams.createTeam(teamObject);
  if (!createResponse.success) return createResponse;

  const res = await queries.teams.addUserToTeam(user.data.id, createResponse.data.id, true);
  if (!res.success) return res;

  return successResponse("Team creation success! Invite people to your team", createResponse.data);
}

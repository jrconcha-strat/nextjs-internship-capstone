import { TeamsSelect, TeamsInsert, UserSelect } from "../../types/index";


export type GetUsersForTeamResponse = 
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: UserSelect[] };

export type GetTeamsResponse =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: TeamsSelect[] }

export type CreateTeamResponse =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: TeamsInsert }
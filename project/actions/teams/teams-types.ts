import { TeamsInsert } from "../../types/index";

export type CreateTeamResponse =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: TeamsInsert };

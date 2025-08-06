import { UserSelect } from "@/types";

export type GetUserIdResponse =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: UserSelect };

export type GetAllUsersResponse =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: UserSelect[] };
export type ServerActionResponse<T> =
  | { success: false; message: string; error: unknown }
  | { success: true; message: string; data: T };

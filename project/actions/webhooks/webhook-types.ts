export type PrimaryEmailResult =
  | { success: true; primaryEmailAddress: string }
  | { success: false; message: string; error: string };

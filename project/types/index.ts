import * as schema from "@/lib/db/schema";
import { projectSchemaForm } from "@/lib/validations/validations";
import z from "zod";


// For Project Creation and Update Form
export type ProjectFormInput = z.input<typeof projectSchemaForm>; // This is because our input for duedate field accepts string.
export type ProjectFormOutput = z.output<typeof projectSchemaForm>; // For after validation, dueDate output is a Date or null.

// Query Types
export type QueryResponse<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; error: unknown };

// Type Narrowing for create query utilities.
export type ObjectInsert = UserInsert | ProjectInsert | ListInsert | TaskInsert | CommentInsert | TeamsInsert;
export type ObjectSelect = UserSelect | ProjectSelect | ListSelect | TaskSelect | CommentSelect | TeamsSelect;

// Type Safety
export type UserInsert = typeof schema.users.$inferInsert;
export type UserSelect = typeof schema.users.$inferSelect;

export type ProjectInsert = typeof schema.projects.$inferInsert;
export type ProjectSelect = typeof schema.projects.$inferSelect;

export type ListInsert = typeof schema.lists.$inferInsert;
export type ListSelect = typeof schema.lists.$inferSelect;

export type TaskInsert = typeof schema.tasks.$inferInsert;
export type TaskSelect = typeof schema.tasks.$inferSelect;

export type CommentInsert = typeof schema.comments.$inferInsert;
export type CommentSelect = typeof schema.comments.$inferSelect;

export type TeamsInsert = typeof schema.teams.$inferInsert
export type TeamsSelect = typeof schema.teams.$inferSelect

export type UsersToTeamsInsert = typeof schema.users_to_teams.$inferInsert
export type UsersToTeamsSelect = typeof schema.users_to_teams.$inferSelect

// Note for interns: These types should match your database schema
// Update as needed when implementing the actual database schema

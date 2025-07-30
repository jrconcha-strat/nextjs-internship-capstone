import * as schema from "@/lib/db/schema";

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


// Note for interns: These types should match your database schema
// Update as needed when implementing the actual database schema

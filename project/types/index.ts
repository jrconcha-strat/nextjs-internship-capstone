import { users } from "@/lib/db/schema";
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  lists: List[];
}

export interface List {
  id: string;
  name: string;
  projectId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  listId: string;
  assigneeId?: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Note for interns: These types should match your database schema
// Update as needed when implementing the actual database schema

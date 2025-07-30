// TODO: Task 3.6 - Set up data validation with Zod schemas

/*
TODO: Implementation Notes for Interns:

1. Install Zod: pnpm add zod
2. Create validation schemas for all forms and API endpoints
3. Add proper error messages
4. Set up client and server-side validation

Example schemas needed:
- Project creation/update
- Task creation/update
- User profile update
- List/column management
- Comment creation

Example structure:
import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  dueDate: z.date().min(new Date(), 'Due date must be in future').optional(),
})

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  assigneeId: z.string().uuid().optional(),
})
*/

// Placeholder exports to prevent import errors
export const projectSchema = "TODO: Implement project validation schema"
export const taskSchema = "TODO: Implement task validation schema"
export const userSchema = "TODO: Implement user validation schema"
export const listSchema = "TODO: Implement list validation schema"
export const commentSchema = "TODO: Implement comment validation schema"

import { priorityTuple, statusTuple } from "@/lib/db/enums";
import * as z from "zod";

// Runtime Safety, Validation
export const userZodInsert = z.object({
  clerkId: z.string(),
  email: z.string(),
  name: z.string(),
  image_url: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
});

export const userZodSelect = userZodInsert.extend({
  id: z.number(),
});

export const projectZodInsert = z.object({
  name: z.string(),
  description: z.string().nullable(),
  status: z.enum(statusTuple),
  ownerId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
  dueDate: z.date().nullable(),
});

export const projectZodSelect = projectZodInsert.extend({
  id: z.number(),
});

export const listZodInsert = z.object({
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
  projectId: z.number(),
  position: z.number(),
});

export const listZodSelect = listZodInsert.extend({
  id: z.number(),
});

export const taskZodInsert = z.object({
  title: z.string(),
  description: z.string().nullable(),
  listId: z.number(),
  priority: z.enum(priorityTuple),
  labels: z.array(z.string()).nullable(),
  dueDate: z.date().nullable(),
  position: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
});

export const taskZodSelect = taskZodInsert.extend({
  id: z.number(),
});

export const commentZodInsert = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  isArchived: z.boolean(),
  archivedAt: z.date().nullable(),
  id: z.number(),
  content: z.string().nullable(),
  taskId: z.number(),
  authorId: z.number(),
});

export const commentZodSelect = commentZodInsert.extend({
  id: z.number(),
});
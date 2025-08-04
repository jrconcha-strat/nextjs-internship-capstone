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
import { priorityTuple, statusTuple } from "@/lib/db/db-enums";
import { errorTemplates, today } from "./validations-utils";
import * as z from "zod";

// Runtime Safety, Validation

export const userSchema = z.object({
  id: z.int().min(1, { error: "ID Cannot be less than zero." }),
  clerkId: z.string().startsWith("user_"),
  email: z.email(errorTemplates.emailFormatError),
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-zÀ-ÿ'\- ]+$/, errorTemplates.nameFormatError)
    .min(1, errorTemplates.nameMinError)
    .max(100, errorTemplates.nameMaxError),
  image_url: z.string().startsWith("https://img.clerk.com/"),
  createdAt: z.date().max(new Date()), // Allow only past or current dates.
  updatedAt: z.date().max(new Date()),
  archivedAt: z.date().max(new Date()).nullable(),
});

// This validates the user object that will be inserted into the database.
export const userSchemaDB = userSchema.omit({
  id: true,
});

// This validates the user info form that will be passed from the UI to the server.
export const userSchemaForm = userSchema.omit({
  id: true,
  clerkId: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

export const projectSchema = z.object({
  id: z.int().min(1, errorTemplates.idMinError),
  name: z
    .string()
    .trim()
    .min(1, errorTemplates.nameMinError)
    .max(100, errorTemplates.nameMaxError),
  description: z
    .string()
    .trim()
    .max(200, errorTemplates.descriptionMaxError)
    .nullable(),
  status: z.enum(statusTuple),
  ownerId: z.int().min(1, errorTemplates.idMinError),
  dueDate: z.date().min(today, errorTemplates.dueDateMinError).nullable(), // Allow only Today or Future dates
  createdAt: z.date().max(new Date()),
  updatedAt: z.date().max(new Date()),
  archivedAt: z.date().max(new Date()).nullable(),
});

export const projectSchemaDB = projectSchema.omit({
  id: true,
});

export const projectSchemaForm = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

export const listSchema = z.object({
  id: z.int().min(1, errorTemplates.idMinError),
  name: z
    .string()
    .trim()
    .min(1, errorTemplates.nameMinError)
    .max(100, errorTemplates.nameMaxError),
  projectId: z.int().min(1, errorTemplates.idMinError),
  position: z.int().min(0, errorTemplates.positionMinError),
  createdAt: z.date().max(new Date()),
  updatedAt: z.date().max(new Date()),
  archivedAt: z.date().max(new Date()).nullable(),
});

export const listSchemaDB = listSchema.omit({
  id: true,
});

export const listSchemaForm = listSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

export const taskSchema = z.object({
  id: z.int().min(1, errorTemplates.idMinError),
  title: z
    .string()
    .trim()
    .min(1, errorTemplates.titleMinError)
    .max(50, errorTemplates.titleMaxError),
  description: z
    .string()
    .trim()
    .max(200, errorTemplates.descriptionMaxError)
    .nullable(),
  listId: z.int().min(1, errorTemplates.idMinError),
  priority: z.enum(priorityTuple),
  dueDate: z.date().min(today, errorTemplates.dueDateMinError).nullable(),
  position: z.int().min(0, errorTemplates.positionMinError),
  createdAt: z.date().max(new Date()),
  updatedAt: z.date().max(new Date()),
  archivedAt: z.date().max(new Date()).nullable(),
});

export const taskSchemaDB = taskSchema.omit({
  id: true,
});

export const taskSchemaForm = taskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

export const commentSchema = z.object({
  id: z.int().min(1, errorTemplates.idMinError),
  content: z.string().min(15, errorTemplates.contentMinError).nullable(), // https://ux.stackexchange.com/questions/98672/what-is-the-ideal-maximum-of-the-length-of-a-comment-or-reply
  taskId: z.int().min(1, errorTemplates.idMinError),
  parentCommentId: z.int().min(1, errorTemplates.idMinError),
  authorId: z.int().min(1, errorTemplates.idMinError),
  createdAt: z.date().max(new Date()),
  updatedAt: z.date().max(new Date()),
  archivedAt: z.date().max(new Date()).nullable(),
});

export const commentSchemaDB = commentSchema.omit({
  id: true,
});

export const commentSchemaForm = commentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
});

import { priorityTuple, rolesTuple, statusTuple } from "@/lib/db/db-enums";
import { errorTemplates, today } from "./validations-utils";
import * as z from "zod";

export const userSchema = z
  .object({
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
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
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
});

export const projectSchema = z
  .object({
    id: z.int().min(1, errorTemplates.idMinError),
    name: z.string().trim().min(1, errorTemplates.nameMinError).max(100, errorTemplates.nameMaxError),
    description: z.string().trim().max(200, errorTemplates.descriptionMaxError).nullable(),
    status: z.enum(statusTuple),
    ownerId: z.int().min(1, errorTemplates.idMinError),
    dueDate: z.union([
      z
        .string()
        .transform((val) => new Date(val))
        .pipe(z.date().min(today, errorTemplates.dueDateMinError)),
      z.date().min(today, errorTemplates.dueDateMinError).nullable(),
    ]), // Allow only Today or Future dates
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });

export const projectSchemaDB = projectSchema.omit({
  id: true,
});

export const projectSchemaForm = projectSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true,
    status: true,
  })
  .extend({
    teamIds: z.array(z.int()).min(1, "Select at least one team"), // Because on project creation, we must have a team assigned.
  });

export const listSchema = z
  .object({
    id: z.int().min(1, errorTemplates.idMinError),
    name: z.string().trim().min(1, errorTemplates.nameMinError).max(100, errorTemplates.nameMaxError),
    projectId: z.int().min(1, errorTemplates.idMinError),
    position: z.int().min(0, errorTemplates.positionMinError),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });

export const listSchemaDB = listSchema.omit({
  id: true,
});

export const listSchemaForm = listSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  projectId: true,
  position: true,
});

export const taskSchema = z
  .object({
    id: z.int().min(1, errorTemplates.idMinError),
    title: z.string().trim().min(1, errorTemplates.titleMinError).max(50, errorTemplates.titleMaxError),
    description: z.string().trim().max(200, errorTemplates.descriptionMaxError).nullable(),
    listId: z.int().min(1, errorTemplates.idMinError),
    priority: z.enum(priorityTuple),
    dueDate: z.date().min(today, errorTemplates.dueDateMinError).nullable(),
    position: z.int().min(0, errorTemplates.positionMinError),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });

export const taskSchemaDB = taskSchema.omit({
  id: true,
});

export const taskSchemaForm = taskSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    position: true,
    listId: true,
  })
  .extend({ assigneeIds: z.array(z.int()).nullable() }); // Because on task creation, we can assign zero, one or more members.

export const commentSchema = z
  .object({
    id: z.int().min(1, errorTemplates.idMinError),
    content: z.string().min(15, errorTemplates.contentMinError).nullable(), // https://ux.stackexchange.com/questions/98672/what-is-the-ideal-maximum-of-the-length-of-a-comment-or-reply
    taskId: z.int().min(1, errorTemplates.idMinError),
    parentCommentId: z.int().min(1, errorTemplates.idMinError),
    authorId: z.int().min(1, errorTemplates.idMinError),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });

export const commentSchemaDB = commentSchema.omit({
  id: true,
});

export const commentSchemaForm = commentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const teamSchema = z
  .object({
    id: z.int().min(1, errorTemplates.idMinError),
    teamName: z.string().trim().min(1, errorTemplates.teamNameMinError).max(50, errorTemplates.teamNameMaxError),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });
export const teamSchemaDB = teamSchema.omit({
  id: true,
});

export const teamSchemaForm = teamSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const usersToTeamsSchema = z
  .object({
    team_id: z.int().min(1, errorTemplates.idMinError),
    user_id: z.int().min(1, errorTemplates.idMinError),
    role: z.enum(rolesTuple),
    isCreator: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const nowTime = now.getTime();

    if (data.createdAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["createdAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "createdAt cannot be in the future.",
      });
    }

    if (data.updatedAt.getTime() > nowTime) {
      ctx.addIssue({
        path: ["updatedAt"],
        code: "too_big",
        maximum: nowTime,
        inclusive: true,
        origin: "date",
        message: "updatedAt cannot be in the future.",
      });
    }
  });

export const addMembersSchemaForm = z.object({
  user_Ids: z.array(z.int()).min(1, "Select at least one member."),
});

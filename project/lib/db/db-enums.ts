import { pgEnum } from "drizzle-orm/pg-core";
export const priorityTuple = [
  "unselected", // Default
  "low",
  "medium",
  "high",
] as const; // This makes it a tuple, which is required to be passed to priorityEnum.

export const statusTuple = [
  "Completed",
  "On-hold",
  "In Progress",
  "Planning", // Default
  "Review",
] as const;

export const rolesTuple = [
  "No Role Yet", // Default
  "Project Manager",
  "Developer",
  "QA Engineer",
  "Designer",
] as const;

export const priorityEnum = pgEnum("priority", priorityTuple);
export const statusEnum = pgEnum("status", statusTuple);
export const rolesEnum = pgEnum("role_name", rolesTuple);

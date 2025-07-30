import { pgEnum } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("role_name", [
  "No Role Yet", // Default
  "Project Manager",
  "Developer",
  "QA Engineer",
  "Designer",
]);
export const priorityEnum = pgEnum("priority", [
  "unselected", // Default
  "low",
  "medium",
  "high",
]);
export const statusEnum = pgEnum("status", [
  "Completed",
  "On-hold",
  "In Progress",
  "Planning", // Default
  "Review",
]);

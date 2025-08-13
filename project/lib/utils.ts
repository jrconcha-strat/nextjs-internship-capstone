import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const projectStatusColor = {
  Completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  "On-hold": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Planning: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Review: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
} as const;

export const taskPriorityColor = {
  low: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
} as const;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function areStringArraysEqual(a: string[] | null, b: string[] | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;

  return a.every((val, index) => val === b[index]);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function capitalize(string: string): string {
  if (string.length === 0) return string;
  return string[0].toUpperCase() + string.slice(1);
}

export function getTempId(): number {
  const tempId = -Math.floor(Math.random() * 1e9); // negative temp id to avoid collisions
  return tempId;
}

// Perform shallow comparison. Does not handle nested comparisons like for objects or arrays.
// To be used within update query utilities to identify changed fields to be updated.
// export function getDataDiff<T>(existingData: T, newData: T): Partial<T> {
//   const changed: Partial<T> = {};

//   for (const [key, oldValue] of Object.entries(existingData)) {
//     const newValue = (newData as any)[key];

//     if (oldValue !== newValue) {
//       (changed as any)[key] = newValue;
//     }
//   }

//   return changed;
// }

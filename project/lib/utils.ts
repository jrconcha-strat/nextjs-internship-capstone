import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function areStringArraysEqual(
  a: string[] | null,
  b: string[] | null,
): boolean {
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

import { RecentProjects } from "@/types";
import { cookies } from "next/headers";

// Development
const API_BASE_URL = "http://localhost:3000/api/";

type APIResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      message: string;
      error: Error;
    };

export async function getRecentProjects() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const route = "projects/recent-projects/";
    const res = await fetch(API_BASE_URL + route, { method: "GET", headers: { Cookie: cookieHeader } });
    return (await res.json()) as APIResponse<RecentProjects[]>;
  } catch (e) {
    console.error("Error fetching recent projects:", e);
    throw e;
  }
}

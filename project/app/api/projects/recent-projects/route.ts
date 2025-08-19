import { NextResponse } from "next/server";
import { db } from "@/lib/db/db-index";
import * as schema from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { queries } from "@/lib/db/queries/queries";
import { UserSelect } from "@/types";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });

    const res = await queries.users.getByClerkId(user.id);
    if (!res.success) return NextResponse.json({ success: false, message: "Unable to get user's id" }, { status: 404 });

    const userId = res.data.id;

    const result = await db
      .select()
      .from(schema.projects)
      .innerJoin(schema.teams_to_projects, eq(schema.teams_to_projects.project_id, schema.projects.id))
      .innerJoin(schema.users_to_teams, eq(schema.users_to_teams.team_id, schema.teams_to_projects.team_id))
      .where(eq(schema.users_to_teams.user_id, userId))
      .orderBy(sql`${schema.projects.createdAt} desc `)
      .limit(3);

    const projects = result.map((row) => row.projects);

    // Deduplicate
    const projectIds = Array.from(new Set(projects.map((project) => project.id)));
    const uniqueProjects = projectIds.map((id) => projects.find((p) => p.id === id)).filter((p) => p !== undefined);

    // Retrieve team member count
    const teamMembersResults: UserSelect[][] = await Promise.all(
      uniqueProjects.map(async (p) => {
        const res = await queries.projects.getAllMembersForProject(p.id);
        return res.success ? res.data : [];
      }),
    );

    // Get only needed fields
    const projectsData = uniqueProjects.map((project, idx) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      dueDate: project.dueDate,
      updatedAt: project.updatedAt,
      status: project.status,
      memberCount: teamMembersResults[idx].length,
      memberImages: teamMembersResults[idx].map((tm) => tm.image_url),
    }));

    return NextResponse.json({
      success: true,
      message: "Successfully retrieved user recent projects",
      data: projectsData ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch recent projects.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

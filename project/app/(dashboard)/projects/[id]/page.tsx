"use client";
import { useProjects } from "@/hooks/use-projects";
import { use } from "react";
import LoadingUI from "@/components/ui/loading-ui";
import { KanbanBoard } from "@/components/kanban-board/kanban-board";
import ProjectHeading from "@/components/projects/project-heading";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const project_id = Number(id);
  const { project, isProjectLoading, projectError } = useProjects(project_id);

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUI />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div className="space-y-6">
      {/* Project Heading */}
      <ProjectHeading project={project} />

      {/* Kanban Board */}
      <KanbanBoard projectId={project_id} />
    </div>
  );
}

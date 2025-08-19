"use client";
import { useProjects } from "@/hooks/use-projects";
import { use } from "react";
import { KanbanBoard } from "@/components/kanban-board/kanban-board";
import ProjectHeading from "@/components/projects/project-heading";
import { useLists } from "@/hooks/use-lists";
import { useTasks } from "@/hooks/use-tasks";
import { Loader2Icon } from "lucide-react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project_id = Number(id);
  const { project, isProjectLoading } = useProjects(project_id);
  const { lists, isLoadingLists } = useLists(project_id);
  const { projectTasks, isProjectTasksLoading } = useTasks({ project_id: project_id });

  if (isProjectLoading || isLoadingLists || isProjectTasksLoading) {
    <div className="flex w-full h-full justify-center items-center gap-2">
      <Loader2Icon />
      <p className="w-full h-full text-center text-sm text-foreground/50">Loading</p>
    </div>;
  }

  if (!project || !lists || !projectTasks) {
    return (
      <div className="flex w-full h-full justify-center items-center">
        <p className="w-full h-full text-center text-sm text-foreground/50">
          Unable to load projects data. Please refresh the page
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Heading */}
      <ProjectHeading project={project} />

      {/* Kanban Board */}
      <KanbanBoard tasks={projectTasks} lists={lists} projectId={project_id} />
    </div>
  );
}

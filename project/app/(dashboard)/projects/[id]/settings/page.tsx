"use client";
import { use } from "react";
import ProjectHeading from "@/components/projects/project-heading";
import { useProjects } from "@/hooks/use-projects";
import LoadingUI from "@/components/ui/loading-ui";

export default function ProjectSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const { project, isProjectLoading, projectError } = useProjects(Number(id));

  if (!project) {
    if (!project && isProjectLoading) {
      return <LoadingUI />;
    }
    throw new Error(projectError?.message);
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectHeading project={project} />
    </div>
  );
}

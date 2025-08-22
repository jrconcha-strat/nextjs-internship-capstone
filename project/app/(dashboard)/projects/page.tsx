"use client";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import ProjectsSection from "@/components/projects/projects-section";
import { useProjects } from "@/hooks/use-projects";

export default function ProjectsPage() {
  const { projects } = useProjects();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">Projects</h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">Manage and organize your team projects</p>
        </div>
        <CreateProjectButton />
      </div>

      {/* Projects Section */}
      {projects ? (
        <ProjectsSection projectsData={projects} />
      ) : (
        <div className="flex justify-center">
          {" "}
          <p className="text-dark-grey-100"> Unable to get project data. Please refresh the page.</p>{" "}
        </div>
      )}

    </div>
  );
}

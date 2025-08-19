"use client";
import { FC } from "react";
import { ProjectSelect } from "@/types";
import ProjectCard from "./project-card";

type ProjectsGridProps = {
  projects: ProjectSelect[];
};
const ProjectsGrid: FC<ProjectsGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  );
};

export default ProjectsGrid;

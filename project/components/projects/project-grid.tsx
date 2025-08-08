import { Calendar, Users, MoreHorizontal } from "lucide-react";
import { FC } from "react";
import { ProjectSelect } from "@/types";
import { formatDate } from "../../lib/utils";
import ProjectCard from "./project-card";

type ProjectGridProps = {
  projects: ProjectSelect[];
};
const ProjectGrid: FC<ProjectGridProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <ProjectCard key={index} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;

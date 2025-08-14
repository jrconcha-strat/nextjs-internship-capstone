import { ProjectSelect } from "@/types";
import { ArrowLeft, Calendar, Link, MoreHorizontal, Settings, Users } from "lucide-react";
import { FC } from "react";

type ProjectHeadingProps = {
  project: ProjectSelect;
};

const ProjectHeading: FC<ProjectHeadingProps> = ({ project }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link
          href="/projects"
          className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">{project.name}</h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-1">
            Kanban board view for project management
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors">
          <Users size={20} />
        </button>
        <button className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors">
          <Calendar size={20} />
        </button>
        <button className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProjectHeading;

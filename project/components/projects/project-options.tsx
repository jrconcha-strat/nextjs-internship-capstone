"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useProjects } from "@/hooks/use-projects";

type ProjectOptionsProps = {
  project_id: number;
};

const ProjectOptions: FC<ProjectOptionsProps> = ({ project_id }) => {
  const { deleteProject, isProjectDeleteLoading } = useProjects();

  function onClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation(); // Prevent clicks on dropdown from redirecting to the project card slug page.
    deleteProject(project_id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <DropdownMenuItem disabled={isProjectDeleteLoading} variant="destructive" onClick={(e) => onClick(e)}>
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectOptions;

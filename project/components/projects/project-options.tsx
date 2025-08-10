"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useProjects } from "@/hooks/use-projects";

type ProjectOptionsProps = {
  project_id: number;
  setEditModalOpen: (val: boolean) => void;
};

const ProjectOptions: FC<ProjectOptionsProps> = ({ project_id, setEditModalOpen }) => {
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
        <DropdownMenuItem
          variant="default"
          onClick={() => {
            setEditModalOpen(true);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isProjectDeleteLoading} variant="destructive" onClick={(e) => onClick(e)}>
          Delete Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectOptions;

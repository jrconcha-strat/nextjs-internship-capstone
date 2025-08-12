"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTasks } from "@/hooks/use-tasks";

type TaskOptionsProps = {
  task_id: number;
  list_id: number;
  className: string;
};

const TaskOptions: FC<TaskOptionsProps> = ({ task_id, list_id, className }) => {
  const { deleteTask, isDeleteTaskLoading } = useTasks({ task_id, list_id });

  function onClick() {
    deleteTask({ task_id, list_id });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="ghost" className="h-5 w-1">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={isDeleteTaskLoading} variant="destructive" onClick={onClick}>
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskOptions;

"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useLists } from "@/hooks/use-lists";

type KanbanListOptionsProps = {
  project_id: number;
  list_id: number;
  onEdit: () => void;
  isDone: boolean;
};

const KanbanListOptions: FC<KanbanListOptionsProps> = ({ project_id, list_id, onEdit, isDone }) => {
  const { deleteList, isListDeleteLoading, updateListsStatus } = useLists(project_id);

  function onClick() {
    deleteList({ project_id, list_id });
  }

  function setAsDone() {
    updateListsStatus({ new_done_list_id: list_id });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={setAsDone} disabled={isDone}>
          {" "}
          {isDone ? "Already the Done Column" : "Set as Done Column"}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isListDeleteLoading} variant="destructive" onClick={onClick}>
          Delete List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KanbanListOptions;

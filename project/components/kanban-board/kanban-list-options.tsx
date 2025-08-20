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
};

const KanbanListOptions: FC<KanbanListOptionsProps> = ({ project_id, list_id, onEdit }) => {
  const { deleteList, isListDeleteLoading } = useLists(project_id);

  function onClick() {
    deleteList({project_id, list_id });
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
        <DropdownMenuItem disabled={isListDeleteLoading} variant="destructive" onClick={onClick}>
          Delete List
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default KanbanListOptions;

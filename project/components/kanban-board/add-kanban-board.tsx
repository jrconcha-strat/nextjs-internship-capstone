import { useLists } from "@/hooks/use-lists";
import { Loader2Icon, Plus } from "lucide-react";
import { FC } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type AddKanbanBoardProps = {
  project_id: number;
  position: number;
};

const AddKanbanBoard: FC<AddKanbanBoardProps> = ({ project_id, position }) => {
  const { createList, isListCreateLoading } = useLists(project_id);

  const onClick = () => {
    const incrementedPosition = position + 1;
    createList({ project_id, position: incrementedPosition });
  };

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            disabled={isListCreateLoading}
            onClick={onClick}
            className="w-full p-1 px-2 border-1 border-border rounded-lg text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
          >
            {" "}
            {isListCreateLoading ? (
              <div className="flex justify-center gap-2">
                <Loader2Icon className="animate-spin " />
              </div>
            ) : (
              <Plus />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add a new column to the board.</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default AddKanbanBoard;

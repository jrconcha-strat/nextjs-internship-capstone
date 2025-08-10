import { useLists } from "@/hooks/use-lists";
import { Loader2Icon } from "lucide-react";
import { FC } from "react";

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
    <div className="min-w-[80px] min-h-[350px] w-80 shrink-0">
      <button
        disabled={isListCreateLoading}
        onClick={onClick}
        className="w-full h-full p-3 border-2 border-dashed border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors"
      >
        {" "}
        {isListCreateLoading ? (
          <div className="flex justify-center gap-2">
            <Loader2Icon className="animate-spin " /> Loading
          </div>
        ) : (
          "+ Add Column"
        )}
      </button>
    </div>
  );
};

export default AddKanbanBoard;

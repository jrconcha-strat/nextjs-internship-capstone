import { Loader2Icon } from "lucide-react";
import { FC } from "react";

const SkeletonKanbanBoard: FC = () => {
  return (
    <>
      {[1, 2, 3].map((list, index) => (
        <div key={index} className="min-w-[80px] w-80 h-[400px] overflow-y shrink-0">
          <div className="flex h-full justify-center items-center p-4 bg-dark-grey-50 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400">
            <Loader2Icon className="animate-spin text-white-smoke-100" />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonKanbanBoard;

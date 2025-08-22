import { Loader2Icon } from "lucide-react";

function SearchBarSkeleton() {
  return <div className=" min-h-[40px] bg-white-smoke-100 dark:bg-dark-grey-100 rounded-md"></div>;
}

function ProjectHeadingSkeleton() {
  return <div className=" min-h-[100px] bg-white-smoke-100 dark:bg-dark-grey-100 rounded-md"></div>;
}

function BreadCrumbsSkeleton() {
  return <div className="max-w-[250px] min-h-[30px] bg-white-smoke-100 dark:bg-dark-grey-100 rounded-md"></div>;
}

function KanbanBoardSkeleton() {
  return (
    <div className="scrollbar-custom flex gap-x-3 overflow-x-auto">
      <div className="flex gap-x-3 py-2">
        {[1, 2, 3, 4].map((list, index) => (
          <div key={index} className="min-w-[80px] w-80 h-[500px] overflow-y shrink-0">
            <div className="flex h-full justify-center items-center p-4 bg-list-bg rounded-lg  border border-border">
              <Loader2Icon className="animate-spin text-white-smoke-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SearchBarSkeleton, ProjectHeadingSkeleton, BreadCrumbsSkeleton, KanbanBoardSkeleton };

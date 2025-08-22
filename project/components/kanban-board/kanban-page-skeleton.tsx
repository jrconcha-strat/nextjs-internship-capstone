import { FC } from "react";
import {
  BreadCrumbsSkeleton,
  KanbanBoardSkeleton,
  ProjectHeadingSkeleton,
  SearchBarSkeleton,
} from "../skeletons/skeletons";

const SkeletonKanbanBoardPage: FC = () => {
  return (
    <div className="flex flex-col gap-y-3">
      {/* Breadcrumbs */}
      <BreadCrumbsSkeleton />

      {/* Project Heading Skeleton */}
      <ProjectHeadingSkeleton />

      {/* Search Bar Skeleton */}
      <SearchBarSkeleton />

      {/* Skeleton Kanban Board */}
      <KanbanBoardSkeleton />
    </div>
  );
};

export default SkeletonKanbanBoardPage;

"use client";

import AddKanbanBoard from "./add-kanban-board";
import { useLists } from "@/hooks/use-lists";
import SkeletonKanbanBoard from "./skeleton-kanban-board";
import TasksSearch from "../tasks/tasks-search";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";
import { useState } from "react";

// TODO: Task 5.1 - Design responsive Kanban board layout
// TODO: Task 5.2 - Implement drag-and-drop functionality with dnd-kit

/*
TODO: Implementation Notes for Interns:

This is the main Kanban board component that should:
- Display columns (lists) horizontally
- Allow drag and drop of tasks between columns
- Support adding new tasks and columns
- Handle real-time updates
- Be responsive on mobile

Key dependencies to install:
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities

Features to implement:
- Drag and drop tasks between columns
- Drag and drop to reorder tasks within columns
- Add new task button in each column
- Add new column functionality
- Optimistic updates (Task 5.4)
- Real-time persistence (Task 5.5)
- Mobile responsive design
- Loading states
- Error handling

State management:
- Use Zustand store for board state (Task 5.3)
- Implement optimistic updates
- Handle conflicts with server state
*/

export function KanbanBoard({ projectId }: { projectId: number }) {
  const { lists, isLoadingLists } = useLists(projectId);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  return (
    <>
      {editTarget && (
        <UpdateKanbanModal
          list_name={editTarget.name}
          list_id={editTarget.id}
          isModalOpen={true}
          setIsModalOpen={(open) => !open && setEditTarget(null)}
        />
      )}
      <div className="flex flex-col bg-background space-y-6 scrollbar-custom">
        {/* Task Search */}
        <TasksSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="scrollbar-custom flex gap-x-3 overflow-x-auto">
          {!lists ? (
            isLoadingLists ? (
              <SkeletonKanbanBoard />
            ) : (
              <div className="flex w-full h-full justify-center">
                {" "}
                <p className="w-full h-full text-center text-sm text-foreground/50">
                  Unable to load lists. Please refresh the page
                </p>
              </div>
            )
          ) : (
            <div className="flex pb-4 gap-x-3">
              {lists.map((list) => (
                <KanbanList
                  key={list.id}
                  list={list}
                  project_id={projectId}
                  onEdit={() => setEditTarget({ id: list.id, name: list.name })}
                  searchTerm={searchTerm}
                />
              ))}
              <AddKanbanBoard project_id={projectId} position={lists.length} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

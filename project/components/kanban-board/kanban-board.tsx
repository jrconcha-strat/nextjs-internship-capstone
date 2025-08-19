"use client";

import AddKanbanBoard from "./add-kanban-board";
import TasksSearch from "../tasks/tasks-search";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";
import { useMemo, useState } from "react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { ListSelect, TaskSelect } from "@/types";

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

type KanbanBoardProps = {
  lists: ListSelect[];
  tasks: TaskSelect[];
  projectId: number;
};

export function KanbanBoard({ lists, tasks, projectId }: KanbanBoardProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  const listIds = useMemo(() => (lists ? lists.map((l) => l.id) : []), [lists]);

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
        <DndContext>
          <div className="scrollbar-custom flex gap-x-3 overflow-x-auto">
            <div className="flex pb-4 gap-x-3">
              <SortableContext items={listIds}>
                {lists.map((list) => (
                  <KanbanList
                    tasks={tasks.filter((t) => t.listId === list.id).sort((a, b) => a.position - b.position)}
                    key={list.id}
                    list={list}
                    project_id={projectId}
                    onEdit={() => setEditTarget({ id: list.id, name: list.name })}
                    searchTerm={searchTerm}
                  />
                ))}
              </SortableContext>

              <AddKanbanBoard project_id={projectId} position={lists.length} />
            </div>
          </div>
        </DndContext>
      </div>
    </>
  );
}

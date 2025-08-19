"use client";

import AddKanbanBoard from "./add-kanban-board";
import TasksSearch from "../tasks/tasks-search";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";
import { useEffect, useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { ListSelect, TaskSelect } from "@/types";
import { createPortal } from "react-dom";
import TaskCard from "../tasks/task-card";

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
  const [kanbanLists, setKanbanLists] = useState<ListSelect[]>(lists);
  const [kanbanTasks, setKanbanTasks] = useState<TaskSelect[]>(tasks);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  const listIds = useMemo(() => (lists ? lists.map((l) => l.id) : []), [lists]);

  const [activeList, setActiveList] = useState<ListSelect | null>(null);
  const [activeTask, setActiveTask] = useState<TaskSelect | null>(null);

  useEffect(() => setKanbanLists(lists), [lists]);

  useEffect(() => setKanbanTasks(tasks), [tasks]);

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "list") {
      setActiveList(event.active.data.current.list);
    }

    if (event.active.data.current?.type === "task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveList(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeListId = active.id;
    const overListId = over.id;

    if (activeListId === overListId) return;

    setKanbanLists((kanbanLists) => {
      // Find the indexes of the respective lists to move
      const activeListIndex = kanbanLists.findIndex((list) => list.id === activeListId);
      const overListIndex = kanbanLists.findIndex((list) => list.id === overListId);
      // Move the activeList to the new position
      return arrayMove(kanbanLists, activeListIndex, overListIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
    const isActiveATask = active.data.current?.type === "task";
    const isOverATask = over.data.current?.type === "task";
    const isOverAList = over.data.current?.type === "list";

    if (!isActiveATask) return;

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      setKanbanTasks((kanbanTasks) => {
        const activeTaskIndex = kanbanTasks.findIndex((task) => task.id === activeId);
        const overTaskIndex = kanbanTasks.findIndex((task) => task.id === overId);

        kanbanTasks[activeTaskIndex].listId = kanbanTasks[overTaskIndex].listId;
        return arrayMove(kanbanTasks, activeTaskIndex, overTaskIndex);
      });
    }

    // Dropping a task over another list
    if (isActiveATask && isOverAList) {
      setKanbanTasks((kanbanTasks) => {
        const activeTaskIndex = kanbanTasks.findIndex((t) => t.id === activeId);
        kanbanTasks[activeTaskIndex].listId = overId as number; // Change the list id
        return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
      });
    }
  }

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
        <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
          <div className="scrollbar-custom flex gap-x-3 overflow-x-auto">
            <div className="flex pb-4 gap-x-3">
              <SortableContext items={listIds}>
                {kanbanLists.map((list) => (
                  <KanbanList
                    tasks={kanbanTasks.filter((t) => t.listId === list.id)} // Not sure if we'll need a .sort for positions for this in the future.
                    key={list.id}
                    list={list}
                    project_id={projectId}
                    onEdit={() => setEditTarget({ id: list.id, name: list.name })}
                    searchTerm={searchTerm}
                  />
                ))}
              </SortableContext>

              <AddKanbanBoard project_id={projectId} position={kanbanLists.length} />
            </div>
          </div>
          {createPortal(
            <DragOverlay>
              {activeList && (
                <KanbanList
                  tasks={kanbanTasks.filter((t) => t.listId === activeList.id)}
                  key={activeList.id}
                  list={activeList}
                  project_id={projectId}
                  onEdit={() => setEditTarget({ id: activeList.id, name: activeList.name })}
                  searchTerm={searchTerm}
                />
              )}
              {activeTask && (
                <TaskCard key={activeTask.id} task={activeTask} list_id={activeTask.listId} project_id={projectId} />
              )}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </div>
    </>
  );
}

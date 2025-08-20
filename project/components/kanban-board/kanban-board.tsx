"use client";

import AddKanbanBoard from "./add-kanban-board";
import TasksSearch from "../tasks/tasks-search";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";
import { useMemo, useState } from "react";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { ListPositionPayload, ListSelect, TaskSelect } from "@/types";
import { createPortal } from "react-dom";
import TaskCard from "../tasks/task-card";
import { UseMutateFunction } from "@tanstack/react-query";
import { debounce } from "lodash";

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
  updateListsPositions: UseMutateFunction<
    ListSelect[],
    Error,
    { listsPayload: ListPositionPayload[]; project_id: number },
    unknown
  >;
};

export function KanbanBoard({ lists, tasks, projectId, updateListsPositions }: KanbanBoardProps) {
  // the problem is that when optimistiacally updating, the lists and task are udpated but not the kanbanLists and kanbanTasks, therefore they are stale.
  const [kanbanLists, setKanbanLists] = useState<ListSelect[]>(lists);
  const [kanbanTasks, setKanbanTasks] = useState<TaskSelect[]>(tasks);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  const listIds = useMemo(() => kanbanLists.map((l) => l.id), [kanbanLists]);

  const [activeList, setActiveList] = useState<ListSelect | null>(null);
  const [activeTask, setActiveTask] = useState<TaskSelect | null>(null);

  const debouncedListUpdate = useMemo(
    () =>
      debounce((listsPayload: ListPositionPayload[], project_id: number) => {
        updateListsPositions({ listsPayload, project_id });
      }, 800),
    [],
  );

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
      const newKanbanLists = arrayMove(kanbanLists, activeListIndex, overListIndex);

      // Update the database with debounce
      const listsPositionsPayload: ListPositionPayload[] = newKanbanLists.map((l) => ({
        id: l.id,
        position: newKanbanLists.indexOf(l) + 1, // Kanban List's New Position In Array + 1
      }));
      debouncedListUpdate(listsPositionsPayload, projectId);

      return newKanbanLists;
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

    // Case: Task Drops over a Task
    if (isActiveATask && isOverATask) {
      setKanbanTasks((kanbanTasks) => {
        const activeTaskIndex = kanbanTasks.findIndex((task) => task.id === activeId);
        const overTaskIndex = kanbanTasks.findIndex((task) => task.id === overId);

        // If over task is in another list, make active task the same list as over
        kanbanTasks[activeTaskIndex].listId = kanbanTasks[overTaskIndex].listId;
        return arrayMove(kanbanTasks, activeTaskIndex, overTaskIndex);
      });
    }

    // Case: Task Drops over A List
    if (isActiveATask && isOverAList) {
      setKanbanTasks((kanbanTasks) => {
        const activeTaskIndex = kanbanTasks.findIndex((t) => t.id === activeId);
        kanbanTasks[activeTaskIndex].listId = overId as number; // Change the list id
        return arrayMove(kanbanTasks, activeTaskIndex, activeTaskIndex);
      });
    }
  }

  return (
    <>
      {editTarget && (
        <UpdateKanbanModal
          list_name={editTarget.name}
          project_id={projectId}
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fakeLists: ListSelect[] = [
  {
    id: 1,
    name: "List 1",
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 1,
  },
  {
    id: 2,
    name: "List 2",
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 2,
  },
  {
    id: 3,
    name: "List 3",
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 3,
  },
  {
    id: 4,
    name: "List 4",
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 4,
  },
  {
    id: 5,
    name: "List 5",
    projectId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: 5,
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fakeTasks: TaskSelect[] = [
  {
    id: 1,
    title: "Task 1-1",
    description: "Description for Task 1-1",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 1,
    priority: "low",
  },
  {
    id: 2,
    title: "Task 1-2",
    description: "Description for Task 1-2",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 2,
    priority: "medium",
  },
  {
    id: 3,
    title: "Task 1-3",
    description: "Description for Task 1-3",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 3,
    priority: "high",
  },
  {
    id: 4,
    title: "Task 1-4",
    description: "Description for Task 1-4",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 4,
    priority: "low",
  },
  {
    id: 5,
    title: "Task 1-5",
    description: "Description for Task 1-5",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 5,
    priority: "medium",
  },
  {
    id: 6,
    title: "Task 1-6",
    description: "Description for Task 1-6",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 6,
    priority: "high",
  },
  {
    id: 7,
    title: "Task 1-7",
    description: "Description for Task 1-7",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 7,
    priority: "low",
  },
  {
    id: 8,
    title: "Task 1-8",
    description: "Description for Task 1-8",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 8,
    priority: "medium",
  },
  {
    id: 9,
    title: "Task 1-9",
    description: "Description for Task 1-9",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 9,
    priority: "high",
  },
  {
    id: 10,
    title: "Task 1-10",
    description: "Description for Task 1-10",
    listId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 10,
    priority: "low",
  },

  {
    id: 11,
    title: "Task 2-1",
    description: "Description for Task 2-1",
    listId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 1,
    priority: "medium",
  },
  {
    id: 12,
    title: "Task 2-2",
    description: "Description for Task 2-2",
    listId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 2,
    priority: "high",
  },
  {
    id: 13,
    title: "Task 2-3",
    description: "Description for Task 2-3",
    listId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 3,
    priority: "low",
  },
  {
    id: 14,
    title: "Task 2-4",
    description: "Description for Task 2-4",
    listId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 4,
    priority: "medium",
  },
  {
    id: 15,
    title: "Task 2-5",
    description: "Description for Task 2-5",
    listId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 5,
    priority: "high",
  },

  {
    id: 16,
    title: "Task 3-1",
    description: "Description for Task 3-1",
    listId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 1,
    priority: "low",
  },
  {
    id: 17,
    title: "Task 3-2",
    description: "Description for Task 3-2",
    listId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 2,
    priority: "medium",
  },
  {
    id: 18,
    title: "Task 3-3",
    description: "Description for Task 3-3",
    listId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 3,
    priority: "high",
  },
  {
    id: 19,
    title: "Task 3-4",
    description: "Description for Task 3-4",
    listId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 4,
    priority: "low",
  },
  {
    id: 20,
    title: "Task 3-5",
    description: "Description for Task 3-5",
    listId: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 5,
    priority: "medium",
  },

  {
    id: 21,
    title: "Task 4-1",
    description: "Description for Task 4-1",
    listId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 1,
    priority: "high",
  },
  {
    id: 22,
    title: "Task 4-2",
    description: "Description for Task 4-2",
    listId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 2,
    priority: "low",
  },
  {
    id: 23,
    title: "Task 4-3",
    description: "Description for Task 4-3",
    listId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 3,
    priority: "medium",
  },
  {
    id: 24,
    title: "Task 4-4",
    description: "Description for Task 4-4",
    listId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 4,
    priority: "high",
  },
  {
    id: 25,
    title: "Task 4-5",
    description: "Description for Task 4-5",
    listId: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 5,
    priority: "low",
  },

  {
    id: 26,
    title: "Task 5-1",
    description: "Description for Task 5-1",
    listId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 1,
    priority: "medium",
  },
  {
    id: 27,
    title: "Task 5-2",
    description: "Description for Task 5-2",
    listId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 2,
    priority: "high",
  },
  {
    id: 28,
    title: "Task 5-3",
    description: "Description for Task 5-3",
    listId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 3,
    priority: "low",
  },
  {
    id: 29,
    title: "Task 5-4",
    description: "Description for Task 5-4",
    listId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 4,
    priority: "medium",
  },
  {
    id: 30,
    title: "Task 5-5",
    description: "Description for Task 5-5",
    listId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: null,
    position: 5,
    priority: "high",
  },
];

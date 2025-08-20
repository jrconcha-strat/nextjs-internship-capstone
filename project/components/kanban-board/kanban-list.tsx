"use client";
import { FC, useMemo, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import { ListSelect, TaskSelect } from "@/types";
import CreateTaskModal from "../modals/create-task-modal";
import TaskCard from "../tasks/task-card";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragButton } from "../ui/drag-button";

type KanbanListProps = {
  tasks: TaskSelect[];
  list: ListSelect;
  project_id: number;
  onEdit: () => void;
  searchTerm: string;
};

const KanbanList: FC<KanbanListProps> = ({ tasks, list, project_id, onEdit, searchTerm }) => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const task_ids = useMemo(() => tasks.map((l) => l.id), [tasks]);

  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered;
  }, [searchTerm, tasks]);

  function openModal() {
    setCreateModalOpen(true);
  }

  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: {
      type: "list",
      list,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0 opacity-80 dark:opacity-45 ">
        <div className={` bg-list-bg min-h-[350px] h-full rounded-lg border border-border ${isDragging ? "ring-2 ring-emerald-50" : ""}`}></div>
      </div>
    );
  }

  return (
    <>
      {isCreateModalOpen && tasks && (
        <CreateTaskModal
          isModalOpen={isCreateModalOpen}
          setIsModalOpen={setCreateModalOpen}
          list_id={list.id}
          project_id={project_id}
          position={tasks.length}
        />
      )}
      <div ref={setNodeRef} style={style} className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0">
        <div className="bg-list-bg min-h-[350px] h-full rounded-lg border border-border ">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <DragButton listeners={listeners} attributes={attributes} />
                <p className="font-semibold text-foreground text-sm">
                  {list.name}
                  <span className="ml-2 px-2 py-1 text-xs bg-foreground/10 rounded-full">{list.position}</span>
                </p>
              </div>

              <KanbanListOptions project_id={project_id} list_id={list.id} onEdit={onEdit} />
            </div>
          </div>

          {/* Scrollable Task Content */}
          <SortableContext items={task_ids} strategy={verticalListSortingStrategy}>
            <div className="min-h-[400px]">
              <div className="scrollbar-custom flex flex-col p-4 mb-4 space-y-3 min-h-[400px] max-h-[400px] overflow-y-auto">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} list_id={list.id} project_id={project_id} />
                ))}
              </div>
            </div>
          </SortableContext>

          <button
            type="button"
            onClick={openModal}
            className="w-full p-3 rounded-lg text-foreground/50 hover:bg-primary/15 dark:hover:bg-primary/8 hover:text-primary transition-colors"
          >
            + Add task
          </button>
        </div>
      </div>
    </>
  );
};

export default KanbanList;

"use client";
import { FC, useMemo, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import { ListSelect } from "@/types";
import { useTasks } from "@/hooks/use-tasks";
import CreateTaskModal from "../modals/create-task-modal";
import { Loader2Icon } from "lucide-react";
import TaskCard from "../tasks/task-card";
import { DndContext } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragButton } from "../ui/drag-button";

type KanbanListProps = {
  list: ListSelect;
  project_id: number;
  onEdit: () => void;
  searchTerm: string;
};

const KanbanList: FC<KanbanListProps> = ({ list, project_id, onEdit, searchTerm }) => {
  const { listTasks, isListTasksLoading, getListTasksError } = useTasks({ list_id: list.id });
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    const filtered = listTasks?.filter((task) => task.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return filtered;
  }, [searchTerm, listTasks]);

  function openModal() {
    setCreateModalOpen(true);
  }

  const { setNodeRef, listeners, attributes, transform, transition } = useSortable({
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

  return (
    <>
      {isCreateModalOpen && listTasks && (
        <CreateTaskModal
          isModalOpen={isCreateModalOpen}
          setIsModalOpen={setCreateModalOpen}
          list_id={list.id}
          project_id={project_id}
          position={listTasks.length}
        />
      )}
      <div ref={setNodeRef} style={style} className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0">
        <div className="bg-primary/7 dark:bg-dark-grey-900 min-h-[350px] h-full rounded-lg border border-border ">
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
          {filteredTasks ? (
            <DndContext>
              <div className="min-h-[400px]">
                <div className="scrollbar-custom flex flex-col py-4 mb-4 space-y-3 min-h-[400px] max-h-[400px] overflow-y-auto">
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} list_id={list.id} project_id={project_id} />
                  ))}
                </div>
              </div>
            </DndContext>
          ) : isListTasksLoading && !getListTasksError ? (
            <div className="p-4 text-center w-full h-full flex justify-center items-center gap-x-2">
              {" "}
              <Loader2Icon size={24} className="animate-spin" /> <p className="text-sm"> Loading Task </p>
            </div>
          ) : (
            getListTasksError && (
              <div className="p-4 text-center w-full h-full flex justify-center items-center gap-x-2">
                {" "}
                <p className="text-sm"> Unable to load task. Please refresh the page. </p>
              </div>
            )
          )}

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

"use client";
import { FC, useMemo, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import { ListSelect } from "@/types";
import { useTasks } from "@/hooks/use-tasks";
import CreateTaskModal from "../modals/create-task-modal";
import { Loader2Icon } from "lucide-react";
import TaskCard from "../tasks/task-card";

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
      <div className="min-w-[80px] min-h-[350px] w-80 overflow-y shrink-0">
        <div className="bg-white-smoke-50 min-h-[350px] h-full dark:bg-outer_space-400 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400">
          <div className="p-4 border-b border-french_gray-300 dark:border-payne's_gray-400">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
                {list.name}
                <span className="ml-2 px-2 py-1 text-xs bg-french_gray-300 dark:bg-payne's_gray-400 rounded-full">
                  {list.position}
                </span>
              </h3>
              <KanbanListOptions project_id={project_id} list_id={list.id} onEdit={onEdit} />
            </div>
          </div>

          {filteredTasks ? (
            <div className="p-4 min-h-[400px]">
              <div className="mb-4 space-y-3 max-h-[400px] overflow-y-auto">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} list_id={list.id} />
                ))}
              </div>
              <button
                type="button"
                onClick={openModal}
                className="w-full p-3 border-2 border-dashed border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors"
              >
                + Add task
              </button>
            </div>
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
        </div>
      </div>
    </>
  );
};

export default KanbanList;

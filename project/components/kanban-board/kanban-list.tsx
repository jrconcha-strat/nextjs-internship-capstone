"use client";
import { FC, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import { ListSelect } from "@/types";
import { useTasks } from "@/hooks/use-tasks";
import CreateTaskModal from "../modals/create-task-modal";
import { Loader2Icon } from "lucide-react";
import { capitalize } from "@/lib/utils";

type KanbanListProps = {
  list: ListSelect;
  project_id: number;
  onEdit: () => void;
};

const KanbanList: FC<KanbanListProps> = ({ list, project_id, onEdit }) => {
  const { listTasks, isListTasksLoading, getListTasksError } = useTasks(list.id);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

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
      <div className="min-w-[80px] w-80 overflow-y shrink-0">
        <div className="bg-platinum-800 dark:bg-outer_space-400 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400">
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

          {listTasks ? (
            <div className="p-4 space-y-3 min-h-[400px]">
              {listTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-2">{task.title}</h4>
                  <p className="text-xs text-payne's_gray-500 dark:text-french_gray-400 mb-3">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300">
                      {capitalize(task.priority)}
                    </span>
                    <div className="w-6 h-6 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      U
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={openModal}
                className="w-full p-3 border-2 border-dashed border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors"
              >
                + Add task
              </button>
            </div>
          ) : isListTasksLoading && !getListTasksError ? (
            <div className="w-full h-full flex justify-center items-center gap-x-2">
              {" "}
              <Loader2Icon size={24} className="animate-spin" /> <p className="text-2xl"> Loading Task </p>
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center gap-x-2">
              {" "}
              <p className="text-2xl"> Unable to load task. Please refresh the page. </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KanbanList;

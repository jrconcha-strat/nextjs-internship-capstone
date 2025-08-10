"use client";
import { ListSelect } from "@/types";
import { FC, useEffect, useState } from "react";
import KanbanListOptions from "./kanban-list-options";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";

type KanbanListsProps = {
  lists: ListSelect[];
  project_id: number;
};

const KanbanLists: FC<KanbanListsProps> = ({ project_id, lists }) => {
  const [sortedLists, setSortedList] = useState<ListSelect[]>([]);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const positionSortedList = [...lists].sort((a, b) => a.position - b.position);
    setSortedList(positionSortedList);
  }, [lists]);

  return (
    <>
      {editTarget && (
        <UpdateKanbanModal
          list_name={editTarget.name}
          project_id={project_id}
          list_id={editTarget.id}
          isModalOpen={true}
          setIsModalOpen={(open) => !open && setEditTarget(null)}
        />
      )}
      {sortedLists.map((list, index) => (
        <div key={index} className="min-w-[80px] w-80 overflow-y shrink-0">
          <div className="bg-platinum-800 dark:bg-outer_space-400 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400">
            <div className="p-4 border-b border-french_gray-300 dark:border-payne's_gray-400">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">
                  {list.name}
                  <span className="ml-2 px-2 py-1 text-xs bg-french_gray-300 dark:bg-payne's_gray-400 rounded-full">
                    {list.position}
                  </span>
                </h3>
                <KanbanListOptions
                  project_id={project_id}
                  list_id={list.id}
                  onEdit={() => setEditTarget({ id: list.id, name: list.name })}
                />
              </div>
            </div>

            <div className="p-4 space-y-3 min-h-[400px]">
              {[1, 2, 3].map((taskIndex) => (
                <div
                  key={taskIndex}
                  className="p-4 bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-2">
                    Sample Task {taskIndex}
                  </h4>
                  <p className="text-xs text-payne's_gray-500 dark:text-french_gray-400 mb-3">
                    This is a placeholder task description
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue_munsell-100 text-blue_munsell-700 dark:bg-blue_munsell-900 dark:text-blue_munsell-300">
                      Medium
                    </span>
                    <div className="w-6 h-6 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      U
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full p-3 border-2 border-dashed border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-payne's_gray-500 dark:text-french_gray-400 hover:border-blue_munsell-500 hover:text-blue_munsell-500 transition-colors">
                + Add task
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default KanbanLists;

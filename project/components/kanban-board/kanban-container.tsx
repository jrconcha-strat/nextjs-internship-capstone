"use client";
import { ListSelect } from "@/types";
import { FC, useEffect, useMemo, useState } from "react";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";
import { DragStartEvent } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

type KanbanContainerProps = {
  lists: ListSelect[];
  project_id: number;
  searchTerm: string;
};

const KanbanContainer: FC<KanbanContainerProps> = ({ project_id, lists, searchTerm }) => {
  const [sortedLists, setSortedList] = useState<ListSelect[]>([]);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    const positionSortedList = [...lists].sort((a, b) => a.position - b.position);
    setSortedList(positionSortedList);
  }, [lists]);

  const listsId = useMemo(() => lists.map((l) => l.id), [lists]);

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
      <SortableContext items={listsId}>
        {sortedLists.map((list) => (
          <KanbanList
            key={list.id}
            list={list}
            project_id={project_id}
            onEdit={() => setEditTarget({ id: list.id, name: list.name })}
            searchTerm={searchTerm}
          />
        ))}
      </SortableContext>
    </>
  );
};

export default KanbanContainer;

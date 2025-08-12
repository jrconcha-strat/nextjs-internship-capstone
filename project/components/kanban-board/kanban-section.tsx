"use client";
import { ListSelect } from "@/types";
import { FC, useEffect, useState } from "react";
import UpdateKanbanModal from "../modals/update-kanban-list-modal";
import KanbanList from "./kanban-list";

type KanbanSectionProps = {
  lists: ListSelect[];
  project_id: number;
};

const KanbanSection: FC<KanbanSectionProps> = ({ project_id, lists }) => {
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
      {sortedLists.map((list) => (
        <KanbanList
          key={list.id}
          list={list}
          project_id={project_id}
          onEdit={() => setEditTarget({ id: list.id, name: list.name })}
        />
      ))}
    </>
  );
};

export default KanbanSection;

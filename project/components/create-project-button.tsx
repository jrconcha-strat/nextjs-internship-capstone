"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import CreateProjectModal from "./modals/create-project-modal";

export function CreateProjectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
      >
        <Plus size={20} className="mr-2" />
        New Project
      </button>
      {isModalOpen && <CreateProjectModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
    </>
  );
}

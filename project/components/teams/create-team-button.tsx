"use client";
import { Users } from "lucide-react";
import { FC, Fragment, useState } from "react";
import CreateTeamModal from "../modals/create-team-modal";

const CreateTeamButton: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Fragment>
      <div className="mt-4 flex gap-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
        >
          <Users size={20} className="mr-2" />
          Create a New Team
        </button>
      </div>

      <CreateTeamModal isModalOpen={isOpen} setIsModalOpen={setIsOpen} />
    </Fragment>
  );
};

export default CreateTeamButton;

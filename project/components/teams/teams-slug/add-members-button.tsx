"use client";
import { Users } from "lucide-react";
import { FC } from "react";

type AddMembersButtonProps = {
  onClick: () => void;
};

const AddMembersButton: FC<AddMembersButtonProps> = ({ onClick }) => {
  return (
    <div className="mt-4 flex gap-x-2">
      <button
        onClick={onClick}
        className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
      >
        <Users size={20} className="mr-2" />
        Add a Member
      </button>
    </div>
  );
};

export default AddMembersButton;

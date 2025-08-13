"use client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { FC } from "react";

type AddMembersButtonProps = {
  onClick: () => void;
};

const AddMembersButton: FC<AddMembersButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="inline-flex gap-4 items-center bg-emerald-600 hover:bg-emerald-400 transition-colors duration-150"
    >
      <Users size={20} />
      Add a Member
    </Button>
  );
};

export default AddMembersButton;

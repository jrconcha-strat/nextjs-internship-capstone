"use client";
import { FC, Fragment, useState } from "react";
import { Button } from "../ui/button";
import ViewTeamModal from "../modals/view-team-modal";
import { TeamsSelect, UserSelect } from "@/types";

type ViewTeamButtonProps = {
  teamData: TeamsSelect;
  teamMembers: UserSelect[];
};

const ViewTeamButton: FC<ViewTeamButtonProps> = ({ teamData, teamMembers }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <Button onClick={() => setIsOpen(!isOpen)} className="bg-emerald-500 text-white hover:bg-emerald-300">
        View
      </Button>

      <ViewTeamModal teamMembers={teamMembers} teamData={teamData} isModalOpen={isOpen} setIsModalOpen={setIsOpen} />
    </Fragment>
  );
};

export default ViewTeamButton;

"use client";
import { XIcon } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { TeamsSelect, UserSelect } from "@/types";
import { formatDate } from "@/lib/utils";
import AddUsersTeam from "../teams/add-users-team";
import { Separator } from "../ui/separator";

import TeamName from "../teams/team-name";

type ViewTeamModalProps = {
  teamData: TeamsSelect;
  teamMembers: UserSelect[];
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
};

const ViewTeamModal: FC<ViewTeamModalProps> = ({ teamData, teamMembers, isModalOpen, setIsModalOpen }) => {
  // Any outside clicks will close the modal.
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the clicked element is not a child of modal, close modal.
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(!isModalOpen);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  // Disable scrolling when modal is open.
  useEffect(() => {
    if (isModalOpen) {
      // Account for layout shift due to hiding the scrollbar. Usually 15px
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add("overflow-hidden");
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    }
    // Cleanup function on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    };
  }, [isModalOpen]);

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div
            ref={modalRef}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full mx-4 md:mx-0 max-w-md shadow-xl"
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-grey-600 dark:text-gray-100">Team Information</h2>
              <button onClick={() => setIsModalOpen(!isModalOpen)} className="hover: " aria-label="Close">
                <XIcon className="text-dark-grey-600 w-full h-full" />
              </button>
            </div>

            <Separator />

            {/* Team Information */}
            <div className="flex flex-col mt-4 gap-y-3">
              {/* Team Name */}
              <TeamName teamData={teamData} />

              {/* Placeholder */}
              <div>
                <p className="text-sm">
                  {" "}
                  Active Projects: <span className="font-bold">14 </span>
                </p>
                <p className="text-sm">
                  {" "}
                  Active Members: <span className="font-bold">{teamMembers.length} </span>
                </p>
              </div>
              <div>
                <p className="text-sm">
                  {" "}
                  Created by: <span className="font-bold">Team </span>
                </p>
                <p className="text-sm">
                  {" "}
                  Created on: <span className="font-bold">{formatDate(teamData.createdAt)} </span>
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm mb-2"> Add Members:</p>
              <AddUsersTeam teamMembers={teamMembers} team_id={teamData.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewTeamModal;

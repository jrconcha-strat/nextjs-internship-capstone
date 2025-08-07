"use client";
import { XIcon } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { TeamsSelect, UserSelect } from "@/types";
import { formatDate } from "@/lib/utils";
import { Separator } from "../ui/separator";

import TeamName from "../teams/team-name";
import ManageMembersTeam from "../teams/manage-members-team";

type ViewTeamModalProps = {
  teamData: TeamsSelect;
  teamMembers: UserSelect[];
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
};

const ViewTeamModal: FC<ViewTeamModalProps> = ({ teamData, teamMembers, isModalOpen, setIsModalOpen }) => {
  // Any outside clicks will close the modal.
  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference for dropdown menu items to stop propagation
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isClickInsideModal = modalRef.current && modalRef.current.contains(event.target as Node);
      const isClickInsideDropdownMenu = dropdownRef.current && dropdownRef.current.contains(event.target as Node);

      // If the dropdown is open and the click is outside of the dropdown menu, close the dropdown
      if (isDropDownOpen && !isClickInsideDropdownMenu) {
        setIsDropDownOpen(false); // Close dropdown
      }

      // If the dropdown is not open and the click is outside of both modal and dropdown, close the modal
      else if (!isDropDownOpen && !isClickInsideModal && !isClickInsideDropdownMenu) {
        setIsModalOpen(false); // Close modal
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropDownOpen, isModalOpen, setIsModalOpen]);

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
            <div className="flex flex-col mt-4 mb-4 gap-y-3">
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
                  Created on: <span className="font-bold">{formatDate(teamData.createdAt)} </span>
                </p>
              </div>
            </div>
            <Separator />
            <div className="mt-4">
              <ManageMembersTeam
                teamMembers={teamMembers}
                team_id={teamData.id}
                dropDownRef={dropdownRef}
                setIsDropDownOpen={setIsDropDownOpen}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewTeamModal;

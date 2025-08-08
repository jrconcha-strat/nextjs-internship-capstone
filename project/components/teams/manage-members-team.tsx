"use client";
import { FC, Fragment, RefObject, useEffect, useState } from "react";
import { UserSelect } from "@/types";
import { getAllUsers } from "@/actions/user-actions";
import { addUsersToTeam, removeUsersFromTeam } from "@/actions/teams-actions";
import { toast } from "sonner";
import { DataTable } from "./data-table-members";
import { columns } from "./members-columns";
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";

type ManageMembersTeamProps = {
  teamMembers: UserSelect[];
  team_id: number;
  dropDownRef: RefObject<HTMLDivElement | null>;
  setIsDropDownOpen: (val: boolean) => void;
};

const modeOptions = ["Add", "Remove"];

const ManageMembersTeam: FC<ManageMembersTeamProps> = ({ teamMembers, team_id, dropDownRef, setIsDropDownOpen }) => {
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [dataTableMode, setDataTableMode] = useState(modeOptions[0]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    };

    fetchUsers();
  }, []); // Added dependency to only run on mount

  // Filter users based on mode.
  const filteredUsers = users.filter((user) => {
    // Show only users who are NOT in the team when adding
    if (dataTableMode === "Add") {
      return !teamMembers.some((teamMember) => teamMember.id === user.id);
    }
    // Show only users who ARE in the team when removing
    if (dataTableMode === "Remove") {
      return teamMembers.some((teamMember) => teamMember.id === user.id);
    }
  });

  // Handle adding selected users to the team
  const handleAddUsers = async (selectedUsers: UserSelect[]) => {
    // Extract the IDs of selected users and pass them
    const selectedUserIds = selectedUsers.map((user) => user.id);
    const response = await addUsersToTeam(selectedUserIds, team_id); // Pass only the IDs
    if (!response.success) {
      toast.error("Error", { description: response.message });
      return;
    }
    toast.success("Success", { description: response.message });
  };

  const handleRemoveUsers = async (selectedUsers: UserSelect[]) => {
    // Extract the IDs of selected users and pass them
    const selectedUserIds = selectedUsers.map((user) => user.id);
    const response = await removeUsersFromTeam(selectedUserIds, team_id); // Pass only the IDs
    if (!response.success) {
      toast.error("Error", { description: response.message });
      return;
    }
    toast.success("Success", { description: response.message });
  };

  const buttonAction = dataTableMode === "Add" ? handleAddUsers : handleRemoveUsers;

  return (
    <Fragment>
      <div ref={dropDownRef} className="flex justify-between">
        <p className="text-md font-bold"> Manage Members</p>
        <DropdownMenu>
          <DropdownMenuTrigger onClick={() => setIsDropDownOpen(true)} asChild>
            <Button variant="outline">
              {dataTableMode} <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent ref={dropDownRef}>
            {modeOptions.map((option, index) => {
              return (
                <DropdownMenuItem key={index} onClick={() => setDataTableMode(modeOptions[index])}>
                  {" "}
                  {option}{" "}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataTable columns={columns} data={filteredUsers} buttonAction={buttonAction} mode={dataTableMode} />
    </Fragment>
  );
};

export default ManageMembersTeam;

"use client";
import { FC, Fragment, useEffect, useState } from "react";
import { UserSelect } from "@/types";
import { getAllUsers, getUserId } from "@/actions/user-actions";
import { DataTable } from "./data-table-members";
import { getMemberColumns } from "./members-columns";
import { DropdownMenuContent, DropdownMenu, DropdownMenuTrigger, DropdownMenuItem } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDownIcon } from "lucide-react";
import { useTeams } from "@/hooks/use-teams";

type ManageMembersTeamProps = {
  teamMembers: UserSelect[];
  team_id: number;
};

const modeOptions = ["Add", "Remove", "View"];

const ManageMembersTeam: FC<ManageMembersTeamProps> = ({ teamMembers, team_id }) => {
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [dataTableMode, setDataTableMode] = useState(modeOptions[0]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const {
    addUsersToTeam,
    isAddingUsersToTeamLoading,
    removeUsersFromTeam,
    isRemoveUsersFromTeamLoading,
    isTeamLeader,
    isTeamLeaderCheckLoading,
  } = useTeams(team_id);

  // This forces "View" mode when not a leader
  useEffect(() => {
    if (!isTeamLeaderCheckLoading && !isTeamLeader) {
      setDataTableMode("View");
    }
  }, [isTeamLeader, isTeamLeaderCheckLoading]);

  useEffect(() => {
    const fetchUsers = async () => {
      const [usersRes, me] = await Promise.all([getAllUsers(), getUserId()]);
      if (usersRes.success) setUsers(usersRes.data);
      if (me.success) setCurrentUserId(me.data.id);
    };

    fetchUsers();
  }, []); // Added dependency to only run on mount

  // Filter users based on mode.
  const filteredUsers = users.filter((user) => {
    // Show ONLY users who ARE in the team, for team members view
    if (dataTableMode === "View") {
      return teamMembers.some((tm) => tm.id === user.id);
    }

    // Show only users who are NOT in the team when adding
    if (dataTableMode === "Add") {
      return !teamMembers.some((teamMember) => teamMember.id === user.id);
    }
    // Show only users who ARE in the team when removing, excluding team leader
    if (dataTableMode === "Remove") {
      const isInTeam = teamMembers.some((teamMember) => teamMember.id === user.id);
      if (!isInTeam) return false;

      // Exclude current leader, so he can't remove himself here
      if (isTeamLeader && currentUserId != null && user.id === currentUserId) {
        return false;
      }

      return true;
    }
  });

  // Handle adding selected users to the team
  const handleAddUsers = async (selectedUsers: UserSelect[]) => {
    // Extract the IDs of selected users and pass them
    const selectedUserIds = selectedUsers.map((user) => user.id);
    addUsersToTeam({ user_ids: selectedUserIds, team_id });
  };

  const handleRemoveUsers = async (selectedUsers: UserSelect[]) => {
    // Extract the IDs of selected users and pass them
    const selectedUserIds = selectedUsers.map((user) => user.id);
    removeUsersFromTeam({ user_ids: selectedUserIds, team_id });
  };

  const buttonAction = dataTableMode === "Add" ? handleAddUsers : handleRemoveUsers;
  const buttonLoadingState = dataTableMode === "Add" ? isAddingUsersToTeamLoading : isRemoveUsersFromTeamLoading;

  return (
    <Fragment>
      <div className="flex justify-between">
        <p className="text-md font-bold">{`${isTeamLeader ? "Manage " : "View "}`} Members</p>
        {isTeamLeader && !isTeamLeaderCheckLoading && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {dataTableMode} <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
        )}
      </div>

      <DataTable
        isTeamLeader={isTeamLeader ?? false}
        columns={getMemberColumns(!!isTeamLeader && dataTableMode !== "View")}
        data={filteredUsers}
        buttonAction={buttonAction}
        buttonLoadingState={buttonLoadingState}
        mode={dataTableMode}
      />
    </Fragment>
  );
};

export default ManageMembersTeam;

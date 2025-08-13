"use client";
import { FC } from "react";
import { Button } from "../../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useTeams } from "@/hooks/use-teams";

type MemberOptionsProps = {
  team_id: number;
  user_id: number;
  isReassignLoading: boolean;
  openModal: () => void;
  setNewLeaderId: (val: number) => void;
};

const MemberOptions: FC<MemberOptionsProps> = ({ team_id, user_id, isReassignLoading, openModal, setNewLeaderId }) => {
  const { removeUserFromTeam, isRemoveUserFromTeamLoading } = useTeams();

  function onRemoveClick() {
    removeUserFromTeam({ user_id, team_id });
  }

  function onAssignClick() {
    setNewLeaderId(user_id);
    openModal();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-5 w-1">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={isReassignLoading} variant="default" onClick={onAssignClick}>
          Assign as Leader
        </DropdownMenuItem>

        <DropdownMenuItem disabled={isRemoveUserFromTeamLoading} variant="destructive" onClick={onRemoveClick}>
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberOptions;

"use client";
import { FC } from "react";
import { Button } from "../../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { useTeams } from "@/hooks/use-teams";

type MemberOptionsProps = {
  team_id: number;
  user_id: number;
};

const MemberOptions: FC<MemberOptionsProps> = ({ team_id, user_id }) => {
  const { removeUsersFromTeam, isRemoveUsersFromTeamLoading } = useTeams();

  function onClick() {
    removeUsersFromTeam({ user_ids: [user_id], team_id }); // We structure user_id into an array here.
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-5 w-1">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem disabled={isRemoveUsersFromTeamLoading} variant="destructive" onClick={onClick}>
          Remove Member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MemberOptions;

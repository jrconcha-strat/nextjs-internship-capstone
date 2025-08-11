"use client";
import { FC } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useTeams } from "@/hooks/use-teams";
import { toast } from "sonner";

type TeamsOptionsProps = {
  team_id: number;
};

const TeamsOptions: FC<TeamsOptionsProps> = ({ team_id }) => {
  const { deleteTeam, isTeamDeleteLoading, isTeamLeader, isTeamLeaderCheckLoading, leaveTeam, isLeaveTeamLoading } =
    useTeams(team_id);

  function onLeaveTeamClick() {
    if (isTeamLeader) {
      toast.error("Unable to Leave Team", {
        description: "Please assign another member as the team leader before leaving.",
      });
      return;
    }
    leaveTeam(team_id);
  }

  function onDeleteTeamClick() {
    deleteTeam(team_id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={isLeaveTeamLoading || isTeamLeaderCheckLoading}
          variant="destructive"
          onClick={onLeaveTeamClick}
        >
          Leave Team
        </DropdownMenuItem>
        {isTeamLeader && (
          <DropdownMenuItem
            disabled={isTeamDeleteLoading || isTeamLeaderCheckLoading}
            variant="destructive"
            onClick={onDeleteTeamClick}
          >
            Delete Team
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamsOptions;

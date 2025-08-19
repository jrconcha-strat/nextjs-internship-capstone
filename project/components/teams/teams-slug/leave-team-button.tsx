"use client";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/use-teams";
import { ArrowLeftFromLine, Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";
import { FC } from "react";
import { toast } from "sonner";

type LeaveTeamButtonProps = {
  team_id: number;
};

const LeaveTeamButton: FC<LeaveTeamButtonProps> = ({ team_id }) => {
  const { isTeamLeader, isTeamLeaderCheckLoading, leaveTeam, isLeaveTeamLoading } = useTeams(team_id);

  function onLeaveTeamClick() {
    if (isTeamLeader) {
      toast.error("Unable to Leave Team", {
        description: "Please assign another member as the team leader before leaving.",
      });
      return;
    }
    leaveTeam(team_id);
    redirect("/teams")
  }

  return (
    <Button
      variant="outline"
      disabled={isLeaveTeamLoading || isTeamLeaderCheckLoading}
      onClick={onLeaveTeamClick}
      className="inline-flex gap-4 items-center hover:bg-destructive/5 text-destructive hover:text-destructive transition-colors duration-150"
    >
      {isLeaveTeamLoading || isTeamLeaderCheckLoading ? (
        <div className="flex gap-2 text-destructive">
          <Loader2Icon className="animate-spin" /> Loading
        </div>
      ) : (
        <>
          {" "}
          <ArrowLeftFromLine size={20} />
          Leave Team
        </>
      )}
    </Button>
  );
};

export default LeaveTeamButton;

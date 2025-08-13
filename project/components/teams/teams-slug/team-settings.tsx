import { Separator } from "@/components/ui/separator";
import { TeamsSelect } from "@/types";
import { FC } from "react";
import TeamName from "../team-name";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/hooks/use-teams";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";

type TeamSettingsProps = {
  team: TeamsSelect;
};

const TeamSettings: FC<TeamSettingsProps> = ({ team }) => {
  const { deleteTeam, isTeamDeleteLoading } = useTeams(team.id);

  function onDeleteClick() {
    deleteTeam(team.id);
    redirect("/teams");
  }

  return (
    <>
      {/* General Settings */}
      <div className="flex flex-col gap-2">
        <p className="text-xl">General</p>
        <Separator className="mb-4" />
        <TeamName teamData={team} />
      </div>
      {/* Danger Settings */}
      <div className="flex flex-col gap-2">
        <p className="text-xl">Danger Zone</p>
        <div className="p-4 border-[1px] border-destructive/50 rounded-md">
          <div className="flex items-center gap-3 text-foreground text-sm">
            <div>
              <p className="font-medium"> Delete Team </p>
              <p className="font-light"> This team will be permanently deleted.</p>
            </div>

            <Button
              onClick={onDeleteClick}
              disabled={isTeamDeleteLoading}
              variant="destructive"
              className="text-xs h-max"
            >
              {isTeamDeleteLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                "Delete team"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamSettings;

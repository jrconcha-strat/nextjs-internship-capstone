import { FC } from "react";
import { Button } from "../ui/button";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "../../types/index";
import TeamMembersAvatars from "./team-members-avatars";
import TeamsOptions from "./teams-options";

type TeamsGridProps = {
  teamsData: TeamsSelect[];
};
const TeamsGrid: FC<TeamsGridProps> = ({ teamsData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {teamsData.map((team, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          {/* Team Information */}
          <h3 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
            {team.teamName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Active Projects: 4{" "}
            {/* Once Projects is finished. Execute appropriate server action and insert here the result. */}
          </p>
          <p className="text-xs text-muted-foreground">
            Created: {formatDate(team.createdAt)}
          </p>

          {/* Member Avatars */}
          <div className="mt-4">
            <TeamMembersAvatars teamId={team.id} />
          </div>

          {/* Buttons */}
          <div className="flex justify-between mt-4">
            <Button className="bg-emerald-500 text-white hover:bg-emerald-300">
              View
            </Button>
            <TeamsOptions team_id={team.id} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamsGrid;

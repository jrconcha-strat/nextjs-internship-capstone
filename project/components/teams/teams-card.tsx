"use client";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "@/types";
import { FC, useEffect, useState } from "react";
import TeamMembersAvatars from "./team-members-avatars";
import ViewTeamButton from "./view-team-button";
import TeamsOptions from "./teams-options";
import { UserSelect } from "../../types/index";
import { getUsersForTeam } from "@/actions/teams-actions";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const [teamMembers, setTeamMembers] = useState<UserSelect[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUsersForTeam(teamData.id);
      if (response.success) {
        setTeamMembers(response.data);
      }
    };

    fetchUsers();
  }, [teamData]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Team Information */}
      <h3 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{teamData.teamName}</h3>
      <p className="text-xs text-muted-foreground">
        Active Projects: 4{" "}
        {/* Once Projects is finished. Execute appropriate server action and insert here the result. */}
      </p>
      <p className="text-xs text-muted-foreground">Created: {formatDate(teamData.createdAt)}</p>

      {/* Member Avatars */}
      <div className="mt-4">
        <TeamMembersAvatars teamMembers={teamMembers} />
      </div>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <ViewTeamButton teamData={teamData} teamMembers={teamMembers} />
        <TeamsOptions team_id={teamData.id} />
      </div>
    </div>
  );
};

export default TeamsCard;

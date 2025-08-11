"use client";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "@/types";
import { FC, useEffect, useState } from "react";
import TeamMembersAvatars from "./team-members-avatars";
import ViewTeamButton from "./view-team-button";
import TeamsOptions from "./teams-options";
import { UserSelect } from "../../types/index";
import { getUsersForTeam } from "@/actions/teams-actions";
import ReassignLeaderModal from "../modals/reassign-leader-modal";
import { useTeams } from "@/hooks/use-teams";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const [teamMembers, setTeamMembers] = useState<UserSelect[]>([]);
  const [isReassignModalOpen, setReassignModalOpen] = useState(false);

  const { teamLeaderUser } = useTeams(teamData.id);

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
    <>
      {/* Modal */}
      {isReassignModalOpen && teamLeaderUser && (
        <ReassignLeaderModal
          isOpen={isReassignModalOpen}
          onClose={() => setReassignModalOpen(false)}
          team_id={teamData.id}
          teamMembers={teamMembers}
          currentLeaderId={teamLeaderUser.id}
        />
      )}

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
          <TeamsOptions team_id={teamData.id} openModal={() => setReassignModalOpen(true)} />
        </div>
      </div>
    </>
  );
};

export default TeamsCard;

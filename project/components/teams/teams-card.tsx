"use client";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "@/types";
import { FC, useState } from "react";
import MembersAvatars from "../ui/members-avatars";
import ViewTeamButton from "./view-team-button";
import TeamsOptions from "./teams-options";
import ReassignLeaderModal from "../modals/reassign-leader-modal";
import { useTeams } from "@/hooks/use-teams";
import { Skeleton } from "@/components/ui/skeleton";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const [isReassignModalOpen, setReassignModalOpen] = useState(false);

  const { teamLeaderUser, teamMembers, isTeamMembersLoading, teamMembersError } = useTeams(teamData.id);
  const max_visible_users = 5;

  return (
    <>
      {/* Modal */}
      {isReassignModalOpen && teamLeaderUser && teamMembers && (
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
          {isTeamMembersLoading ? (
            <Skeleton className="w-32 h-10 rounded-md" />
          ) : teamMembers && !teamMembersError ? (
            <MembersAvatars members={teamMembers} max_visible={max_visible_users} size={8} />
          ) : (
            <p>Unable to load members.</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-4">
          {teamMembers ? (
            <ViewTeamButton teamData={teamData} teamMembers={teamMembers} />
          ) : (
            <Skeleton className="w-16 h-8 rounded-md" />
          )}

          <TeamsOptions team_id={teamData.id} openModal={() => setReassignModalOpen(true)} />
        </div>
      </div>
    </>
  );
};

export default TeamsCard;

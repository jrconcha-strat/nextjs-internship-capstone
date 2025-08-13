"use client";
import { formatDate } from "@/lib/utils";
import { TeamsSelect } from "@/types";
import { FC } from "react";
import MembersAvatars from "../ui/members-avatars";
import { useTeams } from "@/hooks/use-teams";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

type TeamsCardProps = {
  teamData: TeamsSelect;
};

const TeamsCard: FC<TeamsCardProps> = ({ teamData }) => {
  const { teamMembers, isTeamMembersLoading, teamMembersError } = useTeams(teamData.id);
  const max_visible_users = 5;

  return (
    <Link href={`/teams/${teamData.id}`}>
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
            <Skeleton height="32" width="10" />
          ) : teamMembers && !teamMembersError ? (
            <MembersAvatars members={teamMembers} max_visible={max_visible_users} size={8} />
          ) : (
            <p>Unable to load members.</p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default TeamsCard;

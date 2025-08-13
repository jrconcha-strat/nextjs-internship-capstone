"use client";
import AddTeamMembersModal from "@/components/modals/add-team-members-modal";
import AddMembersButton from "@/components/teams/teams-slug/add-members-button";
import MemberCard, { SkeletonMemberCard } from "@/components/teams/teams-slug/member-card";
import LoadingUI from "@/components/ui/loading-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";
import { ArrowLeft, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation
  const team_id = Number(id);
  const [isAddMemberModalOpen, setAddMemberModalOpen] = useState(false);

  // Retrieve team data and its members
  const {
    teamMembers,
    isTeamMembersLoading,
    teamMembersError,
    team,
    isTeamLoading,
    teamError,
    teamLeaderUser,
    isTeamLeaderUserLoading,
    teamLeaderUserError,
    isTeamLeader,
    isTeamLeaderCheckLoading,
    teamLeaderCheckError,
  } = useTeams(team_id);

  // If error, throw error
  if (teamError || teamLeaderUserError || teamMembersError || teamLeaderCheckError) {
    throw new Error("Unable to retrieve team data.");
  }

  // If loading, display loading ui
  if (isTeamLoading || isTeamLeaderUserLoading || isTeamMembersLoading || isTeamLeaderCheckLoading) {
    return <LoadingUI />;
  }

  return (
    <>
      {isAddMemberModalOpen && (
        <AddTeamMembersModal
          isModalOpen={isAddMemberModalOpen}
          closeModal={() => setAddMemberModalOpen(false)}
          team_id={team_id}
        />
      )}
      <div className="space-y-6">
        {/* Teams Heading */}
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/teams"
              className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              {team ? (
                <div>
                  <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">{team.teamName}</h1>
                  <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-1">View your team</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {" "}
                  <Skeleton height="8" width="32" className="lg:w-64" />
                  <Skeleton height="8" width="32" className="lg:w-64" />{" "}
                </div>
              )}
            </div>
          </div>
          {/* Add Member Button - Displays only if user is Team Leader */}
          {isTeamLeader && <AddMembersButton onClick={() => setAddMemberModalOpen(true)} />}
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers && isTeamLeader !== undefined && teamLeaderUser ? (
            teamMembers.map((member) => (
              <MemberCard key={member.id} member={member} team_id={team_id} isTeamLeader={isTeamLeader} teamLeaderData={teamLeaderUser} />
            ))
          ) : (
            <SkeletonMemberCard />
          )}
        </div>

        {/* Loading Spinner */}
        <div
          className={`flex w-full justify-center ${teamMembers ? "opacity-0" : "opacity-100"} transition-opacity duration-150 `}
        >
          <Loader2Icon className="animate-spin text-white-smoke-200" />
        </div>
      </div>
    </>
  );
}

"use client";
import CreateTeamButton from "@/components/teams/create-team-button";
import TeamsSection from "@/components/teams/teams-section";
import { useTeams } from "@/hooks/use-teams";

export default function TeamPage() {
  const { userTeams, isUserTeamsLoading, getUserTeamsError } = useTeams();

  return (
    <div className="space-y-6">
      {/* Teams Heading */}
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        {/* Text Heading and Subheading */}
        <div>
          <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">Teams</h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">Manage team members and permissions</p>
        </div>
        {/* Team Buttons */}
        <CreateTeamButton />
      </div>

      {/* Display Teams */}
      <p className="text-xl font-bold mb-4 text-dark-grey-400">Your Teams</p>
      {!isUserTeamsLoading && userTeams.data ? (
        <TeamsSection teamsData={userTeams.data} />
      ) : (
        <div className="text-center text-sm text-dark-grey-400 mb-4">
          {!userTeams && !isUserTeamsLoading && getUserTeamsError ? (
            <p>Unable to load your teams. Please refresh the page.</p>
          ) : (
            <p>Loading your teams...</p>
          )}
        </div>
      )}
    </div>
  );
}

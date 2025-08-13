"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingUI from "@/components/ui/loading-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/use-teams";
import { ArrowLeft, Loader2Icon, Mail, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise as per Nextjs 15 recommendation

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
  } = useTeams(Number(id));

  // If error, throw error
  if (teamError || teamLeaderUserError || teamMembersError || teamLeaderCheckError) {
    throw new Error("Unable to retrieve team data.");
  }

  // If loading, display loading ui
  if (isTeamLoading || isTeamLeaderUserLoading || isTeamMembersLoading || isTeamLeaderCheckLoading) {
    return <LoadingUI />;
  }

  return (
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
        {isTeamLeader && (
          <div className="mt-4 flex gap-x-2">
            <button
              onClick={() => {}}
              className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
            >
              <Users size={20} className="mr-2" />
              Add a Member
            </button>
          </div>
        )}
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers ? (
          teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={member.image_url}
                      alt="User"
                      onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                      className="transition-opacity duration-200 opacity-0"
                    />
                    <AvatarFallback>
                      <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">{member.name}</h3>
                    <p className="text-sm text-payne's_gray-500 dark:text-french_gray-400">Role</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded">
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div className="flex items-center text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
                <Mail size={16} className="mr-2" />
                {member.email}
              </div>

              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Active
                </span>
                <div className="text-sm text-payne's_gray-500 dark:text-french_gray-400">
                  {Math.floor(Math.random() * 10) + 1} projects
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            {/* Skeleton Cards */}{" "}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6 animate-pulse"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white-smoke-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-white-smoke-200 rounded" />
                    <div className="h-3 w-24 bg-white-smoke-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-48 bg-white-smoke-200 rounded mb-2" />
                <div className="h-3 w-40 bg-white-smoke-200 rounded" />
              </div>
            ))}{" "}
          </>
        )}
      </div>

      {/* Loading Spinner */}
      <div
        className={`flex w-full justify-center ${teamMembers ? "opacity-0" : "opacity-100"} transition-opacity duration-150 `}
      >
        <Loader2Icon className="animate-spin text-white-smoke-200" />
      </div>
    </div>
  );
}

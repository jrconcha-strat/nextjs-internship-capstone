"use client";
import { UserSelect } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail } from "lucide-react";
import { FC } from "react";
import MemberOptions from "./member-options";

type MemberCardProps = {
  member: UserSelect;
  team_id: number;
  isTeamLeader: boolean;
  teamLeaderData: UserSelect;
};

const MemberCard: FC<MemberCardProps> = ({ member, team_id, isTeamLeader, teamLeaderData }) => {
  return (
    <div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <div className="flex items-start justify-between mb-4">
        {/* Image, Name, Role */}
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
        {/* Dropdown - Do not show for Team Members. Do not show for team leader's card */}
        {isTeamLeader && member.id !== teamLeaderData.id && <MemberOptions team_id={team_id} user_id={member.id} />}
      </div>
      
      {/* Email */}
      <div className="flex items-center text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
        <Mail size={16} className="mr-2" />
        {member.email}
      </div>

      {/* Status, and Active Projects count */}
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
          Active
        </span>
        <div className="text-sm text-payne's_gray-500 dark:text-french_gray-400">
          {Math.floor(Math.random() * 10) + 1} projects
        </div>
      </div>
    </div>
  );
};

const SkeletonMemberCard: FC = () => {
  return (
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
  );
};

export { SkeletonMemberCard };

export default MemberCard;

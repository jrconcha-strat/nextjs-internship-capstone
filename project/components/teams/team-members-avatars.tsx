"use client";
import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSelect } from "@/types";

type TeamMembersAvatarsProps = {
  teamMembers: UserSelect[];
};

const TeamMembersAvatars: FC<TeamMembersAvatarsProps> = ({ teamMembers }) => {
  const MAX_VISIBLE = 5;
  const visibleUsers = teamMembers.slice(0, MAX_VISIBLE);
  const remaining = teamMembers.length - MAX_VISIBLE;

  // If teamMembers array is empty or undefined, show loading placeholders
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="flex -space-x-2">
        {Array.from({ length: MAX_VISIBLE }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar key={index} className="h-8 w-8">
          <AvatarImage
            src={user.image_url}
            alt="User"
            onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
            className="transition-opacity duration-200 opacity-0"
          />
          <AvatarFallback>
            <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <Avatar
          className="bg-muted text-xs font-medium text-muted-foreground"
          style={{ width: "32px", height: "32px" }}
        >
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default TeamMembersAvatars;

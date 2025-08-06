"use client";
import { FC, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsersForTeam } from "@/actions/teams/teams-actions";
import { UserSelect } from "@/types";

type TeamMembersAvatarsProps = {
  teamId: number;
};

const TeamMembersAvatars: FC<TeamMembersAvatarsProps> = ({ teamId }) => {
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [loading, setLoading] = useState(true);

  const MAX_VISIBLE = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getUsersForTeam(teamId);
      if (response.success) {
        setUsers(response.data);
      } else {
        console.error(response.message);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [teamId]);

  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const remaining = users.length - MAX_VISIBLE;

  if (loading) {
    return (
      <div className="flex -space-x-2">
        {Array.from({ length: MAX_VISIBLE - 2 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
      {visibleUsers.map((user, index) => (
        <Avatar key={index}>
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
        <Avatar className="bg-muted text-xs font-medium text-muted-foreground">
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default TeamMembersAvatars;

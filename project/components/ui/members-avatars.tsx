"use client";
import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSelect } from "@/types";

type MembersAvatarsProps = {
  members: UserSelect[];
  max_visible: number;
  size: number;
};

const MembersAvatars: FC<MembersAvatarsProps> = ({ members, max_visible, size }) => {
  const MAX_VISIBLE = max_visible;

  const visibleUsers = members.slice(0, MAX_VISIBLE);
  const remaining = members.length - MAX_VISIBLE;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar key={index} className={`h-${size} w-${size}`}>
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
        <Avatar className={`bg-muted text-xs font-medium text-muted-foreground ${`h-${size} w-${size}`}`}>
          <AvatarFallback>+{remaining}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MembersAvatars;

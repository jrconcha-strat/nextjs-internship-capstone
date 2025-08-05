import { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUsersForTeam } from "@/actions/teams/teams-actions";
import { UserIcon } from "lucide-react";

type TeamMembersAvatarsProps = {
  teamId: number;
};

const TeamMembersAvatars: FC<TeamMembersAvatarsProps> = async ({ teamId }) => {
  
  const response = await getUsersForTeam(teamId);
  if (!response.success) {
    throw new Error(response.message);
  }
  // Limit the number of profile avatars displayed on the team card.
  const MAX_VISIBLE = 5;
  const visibleUsers = response.data.slice(0, MAX_VISIBLE);
  const remaining = response.data.length - MAX_VISIBLE;
  return (
    <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2">
      {visibleUsers.map((user, index) => (
        <Avatar key={index}>
          <AvatarImage src={user.image_url} alt="User" />
          <AvatarFallback>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
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

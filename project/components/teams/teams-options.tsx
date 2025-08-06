"use client";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { deleteTeam } from "@/actions/teams/teams-actions";
import { toast } from "sonner";

type TeamsOptionsProps = {
  team_id: number;
};

const TeamsOptions: FC<TeamsOptionsProps> = ({ team_id }) => {
  const [isLoading, setIsLoading] = useState(false);

  async function onClick() {
    setIsLoading(true);

    const response = await deleteTeam(team_id);
    if (!response.success) {
      toast.error("Unable to delete team", { description: response.message });
      return;
    }
    toast.success("Team deleted", { description: response.message });
    setIsLoading(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          disabled={isLoading}
          variant="destructive"
          onClick={onClick}
        >
          Delete Team
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamsOptions;

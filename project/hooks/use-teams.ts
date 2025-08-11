"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTeamsForUser } from "@/actions/teams-actions";
import { getUserId } from "@/actions/user-actions";

export function useTeams() {
  const queryClient = useQueryClient();

  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const getUserIdResponse = await getUserId();
      if(!getUserIdResponse.success) throw new Error(getUserIdResponse.message);
      const res = await getTeamsForUser(getUserIdResponse.data.id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    userTeams: teams,
    isUserTeamsLoading: teams.isLoading,
    getUserTeamsError: teams.error,
  };
}

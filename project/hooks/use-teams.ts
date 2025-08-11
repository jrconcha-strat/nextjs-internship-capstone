"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUsersToTeamAction,
  checkUserIsLeaderAction,
  deleteTeamAction,
  getTeamsForUser,
  removeUsersFromTeamAction,
  updateTeamAction,
} from "@/actions/teams-actions";
import { getUserId } from "@/actions/user-actions";
import { toast } from "sonner";
import z from "zod";
import { teamSchemaForm } from "@/lib/validations/validations";

export function useTeams(team_id?: number) {
  const queryClient = useQueryClient();

  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const getUserIdResponse = await getUserId();
      if (!getUserIdResponse.success) throw new Error(getUserIdResponse.message);
      const res = await getTeamsForUser(getUserIdResponse.data.id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const checkTeamLeader = useQuery({
    queryKey: ["is_team_leader", { teamId: team_id ?? null }],
    enabled: typeof team_id === "number",
    queryFn: async () => {
      if (typeof team_id !== "number") return undefined;

      const getUserIdResponse = await getUserId();
      if (!getUserIdResponse.success) throw new Error(getUserIdResponse.message);

      const checkUserIsLeaderResponse = await checkUserIsLeaderAction(getUserIdResponse.data.id, team_id);
      if (!checkUserIsLeaderResponse.success) throw new Error(checkUserIsLeaderResponse.message);

      return checkUserIsLeaderResponse.data;
    },
  });

  const updateTeam = useMutation({
    mutationFn: async ({
      team_id,
      teamFormData,
    }: {
      team_id: number;
      teamFormData: z.infer<typeof teamSchemaForm>;
    }) => {
      const res = await updateTeamAction(team_id, teamFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Success", { description: "Successfully updated the team." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (team_id: number) => {
      const res = await deleteTeamAction(team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Success", { description: "Successfully deleted the team." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const removeUsersFromTeam = useMutation({
    mutationFn: async ({ user_ids, team_id }: { user_ids: number[]; team_id: number }) => {
      const res = await removeUsersFromTeamAction(user_ids, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Success", { description: "Successfully removed users from the team." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const leaveTeam = useMutation({
    mutationFn: async (team_id: number) => {
      const getUserIdResponse = await getUserId();
      if (!getUserIdResponse.success) throw new Error(getUserIdResponse.message);

      const res = await removeUsersFromTeamAction([getUserIdResponse.data.id], team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Success", { description: "Successfully left the team" });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const addUsersToTeam = useMutation({
    mutationFn: async ({ user_ids, team_id }: { user_ids: number[]; team_id: number }) => {
      const res = await addUsersToTeamAction(user_ids, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Success", { description: "Successfully added users to the team." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  return {
    userTeams: teams,
    isUserTeamsLoading: teams.isLoading,
    getUserTeamsError: teams.error,

    deleteTeam: deleteTeam.mutate,
    isTeamDeleteLoading: deleteTeam.isPending,
    deleteTeamError: deleteTeam.error,

    isTeamLeader: checkTeamLeader.data,
    isTeamLeaderCheckLoading: checkTeamLeader.isPending,
    teamLeaderCheckError: checkTeamLeader.error,

    addUsersToTeam: addUsersToTeam.mutate,
    isAddingUsersToTeamLoading: addUsersToTeam.isPending,
    addUsersToTeamError: addUsersToTeam.error,

    removeUsersFromTeam: removeUsersFromTeam.mutate,
    isRemoveUsersFromTeamLoading: removeUsersFromTeam.isPending,
    removeUsersFromTeamError: removeUsersFromTeam.error,

    leaveTeam: leaveTeam.mutate,
    isLeaveTeamLoading: leaveTeam.isPending,
    leaveTeamError: leaveTeam.error,

    updateTeam: updateTeam.mutate,
    isTeamUpdateLoading: updateTeam.isPending,
    updateTeamError: updateTeam.error,
  };
}

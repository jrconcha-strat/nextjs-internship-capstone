"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUsersToTeamAction,
  checkUserIsLeaderAction,
  deleteTeamAction,
  getProjectsForTeamAction,
  getTeamByIdAction,
  getTeamsForUser,
  getUsersForTeam,
  reassignTeamLeaderAction,
  removeUserFromTeamAction,
  updateTeamAction,
} from "@/actions/teams-actions";
import { getTeamLeaderAction } from "@/actions/teams-actions";
import { getUserId } from "@/actions/user-actions";
import { toast } from "sonner";
import z from "zod";
import { teamSchemaForm } from "@/lib/validations/validations";
import { TeamsSelect, UserSelect } from "@/types";

export function useTeams(team_id?: number) {
  const queryClient = useQueryClient();

  // All teams for current user
  const teams = useQuery({
    queryKey: ["teams", "mine"],
    queryFn: async () => {
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await getTeamsForUser(me.data.id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  // Get team by Id
  const getTeamById = useQuery({
    queryKey: ["team", team_id],
    enabled: typeof team_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, team_id] = queryKey as ["team", number];
      const res = await getTeamByIdAction(team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  // Is current user the leader of this team?
  const checkTeamLeader = useQuery({
    queryKey: ["is_team_leader", { teamId: team_id ?? null }],
    enabled: typeof team_id === "number",
    queryFn: async () => {
      if (typeof team_id !== "number") return undefined;
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await checkUserIsLeaderAction(me.data.id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data as boolean; // true/false
    },
  });

  const teamLeader = useQuery({
    queryKey: ["team_leader", { teamId: team_id ?? null }],
    enabled: typeof team_id === "number",
    staleTime: 60_000,
    queryFn: async () => {
      if (typeof team_id !== "number") return undefined;
      const res = await getTeamLeaderAction(team_id);
      if (!res.success) throw new Error(res.message);
      return res.data; // types.UserSelect
    },
  });

  const teamMembers = useQuery({
    queryKey: ["team_members", { teamId: team_id }],
    enabled: typeof team_id === "number",
    staleTime: 60_000,
    queryFn: async () => {
      if (typeof team_id !== "number") return undefined;
      const res = await getUsersForTeam(team_id);
      if (!res.success) throw new Error(res.message);
      return res.data; // types.UserSelect[]
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
    onMutate: async ({ team_id, teamFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["teams", "mine"] });
      const previousTeams = queryClient.getQueryData<TeamsSelect[]>(["teams", "mine"]);
      // Return teams with updated team
      // Optimistically update the team with the inputted teamFormData
      queryClient.setQueryData<TeamsSelect[]>(["teams", "mine"], (old) =>
        old
          ? old.map((t) =>
              t.id === team_id
                ? {
                    ...t,
                    ...teamFormData,
                  }
                : t,
            )
          : old,
      );

      return { previousTeams };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the team." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["teams", "mine"], context?.previousTeams);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team", { id: variables.team_id }] });
    },
  });

  const deleteTeam = useMutation({
    mutationFn: async (team_id: number) => {
      // Prevent team deletion of teams with projects.
      const teamProjects = await getProjectsForTeamAction(team_id);
      if (!teamProjects.success) throw new Error(teamProjects.message);

      if (teamProjects.data.length > 0) throw new Error("Cannot delete a team with projects assigned.");

      const res = await deleteTeamAction(team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["teams", "mine"] });
      const previousTeams = queryClient.getQueryData<TeamsSelect[]>(["teams", "mine"]);
      // Return Teams except removed team
      queryClient.setQueryData<TeamsSelect[]>(["teams", "mine"], (old) => old?.filter((team) => team.id !== team_id));

      return { previousTeams };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the team." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["teams", "mine"], context?.previousTeams);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });

  const removeUserFromTeam = useMutation({
    mutationFn: async ({ user_id, team_id }: { user_id: number; team_id: number }) => {
      const res = await removeUserFromTeamAction(user_id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ user_id, team_id }) => {
      await queryClient.cancelQueries({ queryKey: ["team_members", { teamId: team_id }] });
      const previousTeamMembers = queryClient.getQueryData<UserSelect[]>(["team_members", { teamId: team_id }]);
      // Return Members except for the removed member.
      queryClient.setQueryData<UserSelect[]>(["team_members", { teamId: team_id }], (old) =>
        old?.filter((member) => member.id !== user_id),
      );

      return { previousTeamMembers };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully removed from the team." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["team_members"], context?.previousTeamMembers);
    },
    onSettled: () => {
      // Refetch
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
    },
  });

  const leaveTeam = useMutation({
    mutationFn: async (team_id: number) => {
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await removeUserFromTeamAction(me.data.id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["teams", "mine"] });
      const previousTeams = queryClient.getQueryData<TeamsSelect[]>(["teams", "mine"]);
      // Return Teams except left team
      queryClient.setQueryData<TeamsSelect[]>(["teams", "mine"], (old) => old?.filter((team) => team.id !== team_id));

      return { previousTeams };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully left the team" });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["teams", "mine"], context?.previousTeams);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team", { id: team_id }] });
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
    },
  });

  const addUsersToTeam = useMutation({
    mutationFn: async ({ user_ids, team_id }: { user_ids: number[]; team_id: number }) => {
      const res = await addUsersToTeamAction(user_ids, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ user_ids, team_id }) => {
      await queryClient.cancelQueries({ queryKey: ["team_members", { teamId: team_id }] });

      const previousTeamMembers = queryClient.getQueryData<UserSelect[]>(["team_members", { teamId: team_id }]);

      const allUsers = queryClient.getQueryData<UserSelect[]>(["users"]) ?? [];

      // Get the user objects of those users that we will add
      const adds = allUsers.filter((u) => user_ids.includes(u.id));

      // Here we append the new user objects to the current team members (we also de-dupe by id)
      queryClient.setQueryData<UserSelect[]>(["team_members", { teamId: team_id }], (old) => {
        const base = old ?? [];
        const existing = new Set(base.map((m) => m.id)); // Set of ids of existing team members
        const toAdd = adds.filter((m) => !existing.has(m.id)); // Return user objects that is not yet in the array, ensures no duplicates
        return [...base, ...toAdd]; // Append new team members to existing team members
      });

      return { previousTeamMembers };
    },

    onSuccess: () => {
      toast.success("Success", { description: "Successfully added to the team." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["team_members"], context?.previousTeamMembers);
    },
    onSettled: () => {
      // Refetch
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
    },
  });

  const reassignTeamLeader = useMutation({
    mutationFn: async ({
      old_leader_id,
      new_leader_id,
      team_id,
    }: {
      old_leader_id: number;
      new_leader_id: number;
      team_id: number;
    }) => {
      const res = await reassignTeamLeaderAction(old_leader_id, new_leader_id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ old_leader_id, new_leader_id, team_id }) => {
      await queryClient.cancelQueries({ queryKey: ["team_leader", { teamId: team_id }] });

      const previousTeamMembers = queryClient.getQueryData<UserSelect[]>(["team_leader", { teamId: team_id }]);

      // Just Optimistically set the isLeader flag for the old leader and new leader for team members cached data
      queryClient.setQueryData<UserSelect[]>(["team_members", { teamId: team_id }], (old) => {
        if (!old) return old;
        return old.map((m) => {
          if (m.id === old_leader_id) return { ...m, isLeader: false };
          if (m.id === new_leader_id) return { ...m, isLeader: true };
          return m;
        });
      });

      return { previousTeamMembers };
    },

    onSuccess: () => {
      toast.success("Success", { description: "Successfully reassigned leaders." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["team_members"], context?.previousTeamMembers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
      queryClient.invalidateQueries({ queryKey: ["team_leader", { teamId: team_id }] });
      queryClient.invalidateQueries({ queryKey: ["is_team_leader", { teamId: team_id }] });
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
  });

  return {
    // lists
    userTeams: teams,
    isUserTeamsLoading: teams.isLoading,
    getUserTeamsError: teams.error,

    // team by Id
    team: getTeamById.data,
    isTeamLoading: getTeamById.isLoading,
    teamError: getTeamById.error,

    // leader boolean (current user)
    isTeamLeader: checkTeamLeader.data,
    isTeamLeaderCheckLoading: checkTeamLeader.isLoading,
    teamLeaderCheckError: checkTeamLeader.error,

    // leader user (who is the leader)
    teamLeaderUser: teamLeader.data,
    isTeamLeaderUserLoading: teamLeader.isLoading,
    teamLeaderUserError: teamLeader.error,

    // Team members for a team
    teamMembers: teamMembers.data,
    isTeamMembersLoading: teamMembers.isLoading,
    teamMembersError: teamMembers.error,

    // mutations
    deleteTeam: deleteTeam.mutate,
    isTeamDeleteLoading: deleteTeam.isPending,
    deleteTeamError: deleteTeam.error,

    addUsersToTeam: addUsersToTeam.mutate,
    isAddingUsersToTeamLoading: addUsersToTeam.isPending,
    addUsersToTeamError: addUsersToTeam.error,

    removeUserFromTeam: removeUserFromTeam.mutate,
    isRemoveUserFromTeamLoading: removeUserFromTeam.isPending,
    removeUserFromTeamError: removeUserFromTeam.error,

    leaveTeam: leaveTeam.mutate,
    isLeaveTeamLoading: leaveTeam.isPending,
    leaveTeamError: leaveTeam.error,

    updateTeam: updateTeam.mutate,
    isTeamUpdateLoading: updateTeam.isPending,
    updateTeamError: updateTeam.error,

    reassignTeamLeader: reassignTeamLeader.mutate,
    isReassignTeamLeaderLoading: reassignTeamLeader.isPending,
    reassignTeamLeaderError: reassignTeamLeader.error,
  };
}

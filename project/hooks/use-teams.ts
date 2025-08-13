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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      toast.success("Success", { description: "Successfully updated the team." });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      toast.success("Success", { description: "Successfully deleted the team." });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
  });

  const removeUserFromTeam = useMutation({
    mutationFn: async ({ user_id, team_id }: { user_id: number; team_id: number }) => {
      const res = await removeUserFromTeamAction(user_id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
      toast.success("Success", { description: "Successfully removed from the team." });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
  });

  const leaveTeam = useMutation({
    mutationFn: async (team_id: number) => {
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await removeUserFromTeamAction(me.data.id, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      toast.success("Success", { description: "Successfully left the team" });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
  });

  const addUsersToTeam = useMutation({
    mutationFn: async ({ user_ids, team_id }: { user_ids: number[]; team_id: number }) => {
      const res = await addUsersToTeamAction(user_ids, team_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["team_members", { teamId: team_id }] });
      toast.success("Success", { description: "Successfully added to the team." });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team_leader", { teamId: variables.team_id }] });
      queryClient.invalidateQueries({ queryKey: ["is_team_leader", { teamId: variables.team_id }] });
      queryClient.invalidateQueries({ queryKey: ["teams", "mine"] });
      toast.success("Success", { description: "Successfully reassigned leaders." });
    },
    onError: (error) => toast.error("Error", { description: error.message }),
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

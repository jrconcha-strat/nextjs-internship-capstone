"use client";
import { getAllUsers, getUserId } from "@/actions/user-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useUsers() {
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await getAllUsers();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const user = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await getUserId();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    // Get all users
    users: users.data,
    isUsersLoading: users.isLoading,
    getUsersError: users.isError,

    // Get current user
    user: user.data,
    isUserLoading: user.isLoading,
    getUserError: user.isError,
  };
}

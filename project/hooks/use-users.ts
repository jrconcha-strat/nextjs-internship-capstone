"use client";
import { getAllUsers } from "@/actions/user-actions";
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

  return {
    users: users.data,
    isUsersLoading: users.isLoading,
    getUsersError: users.isError,
  };
}

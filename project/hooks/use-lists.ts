"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createListAction, getAllListsAction } from "@/actions/list-actions";

export function useLists(project_id: number) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["lists", project_id],
    queryFn: async () => {
      const res = await getAllListsAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createList = useMutation({
    mutationFn: async ({ project_id, position }: { project_id: number; position: number }) => {
      const res = await createListAction(project_id, position);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Success", { description: "Successfully created the list." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  return {
    lists: list.data,
    isLoadingLists: list.isLoading,
    loadingListError: list.isError,
    createList: createList.mutate,
    isCreateListLoading: createList.isPending,
    createListError: createList.error,
  };
}

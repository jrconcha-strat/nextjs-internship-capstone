"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createListAction, deleteListAction, getAllListsAction, updateListAction } from "@/actions/list-actions";
import { listSchemaForm } from "@/lib/validations/validations";
import z from "zod";

export function useLists(project_id?: number) {
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ["lists", project_id],
    queryFn: async () => {
      if (!project_id) return [];
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

  const deleteList = useMutation({
    mutationFn: async ({ project_id, list_id }: { project_id: number; list_id: number }) => {
      const res = await deleteListAction(project_id, list_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Success", { description: "Successfully deleted the list." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const updateList = useMutation({
    mutationFn: async ({
      project_id,
      list_id,
      listFormData,
    }: {
      project_id: number;
      list_id: number;
      listFormData: z.infer<typeof listSchemaForm>;
    }) => {
      const res = await updateListAction(project_id, list_id, listFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("Success", { description: "Successfully updated the list." });
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
    isListCreateLoading: createList.isPending,
    createListError: createList.error,
    deleteList: deleteList.mutate,
    isListDeleteLoading: deleteList.isPending,
    deleteListError: deleteList.error,
    updateList: updateList.mutate,
    isListUpdateLoading: updateList.isPending,
    updateListError: updateList.error,
  };
}

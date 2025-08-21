"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createListAction,
  deleteListAction,
  getAllListsAction,
  updateListAction,
  updateListsPositionsAction,
  updateListsStatusAction,
} from "@/actions/list-actions";
import { listSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { ListPositionPayload, ListSelect } from "@/types";
import { getTempId } from "@/lib/utils";

export function useLists(project_id: number) {
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

    onMutate: async ({ project_id, position }) => {
      await queryClient.cancelQueries({ queryKey: ["lists"] });

      const previousLists = queryClient.getQueryData<ListSelect[]>(["lists", project_id]);

      const tempId = getTempId();

      // Build an optimistic list
      const now = new Date();
      const optimisticList: ListSelect = {
        id: tempId,
        name: "New Board", // Same as createListAction
        projectId: project_id,
        isDone: false,
        createdAt: now,
        updatedAt: now,
        position: position + 1,
      };

      queryClient.setQueryData<ListSelect[]>(["lists", project_id], (old) => (old ? [...old, optimisticList] : old));

      return { previousLists, tempId };
    },
    onSuccess: (createdList, variables, context) => {
      toast.success("Success", { description: "Successfully created the list." });

      // We replace optimistic list with the tempId with the server-sourced list with actual id
      queryClient.setQueryData<ListSelect[]>(
        ["lists", project_id],
        (old) => old?.map((l) => (l.id === context.tempId ? createdList : l)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["lists", project_id], context?.previousLists);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", project_id] });
    },
  });

  const deleteList = useMutation({
    mutationFn: async ({ project_id, list_id }: { project_id: number; list_id: number }) => {
      const res = await deleteListAction(list_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ project_id, list_id }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", project_id] });

      const previousLists = queryClient.getQueryData<ListSelect[]>(["lists", project_id]);

      queryClient.setQueryData<ListSelect[]>(["lists", project_id], (old) =>
        old ? old.filter((l) => l.id != list_id) : old,
      );

      return { previousLists };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the list." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["lists", project_id], context?.previousLists);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", project_id] });
    },
  });

  const updateList = useMutation({
    mutationFn: async ({
      list_id,
      project_id,
      listFormData,
    }: {
      list_id: number;
      project_id: number;
      listFormData: z.infer<typeof listSchemaForm>;
    }) => {
      const res = await updateListAction(list_id, listFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ list_id, listFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", project_id] });

      const previousLists = queryClient.getQueryData<ListSelect[]>(["lists", project_id]);

      // Optimistically update the team with the inputted listFormData
      queryClient.setQueryData<ListSelect[]>(["lists", project_id], (old) =>
        old
          ? old.map((l) =>
              l.id === list_id
                ? {
                    ...l,
                    ...listFormData,
                  }
                : l,
            )
          : old,
      );

      return { previousLists };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the list." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["lists", project_id], context?.previousLists);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lists", variables.project_id] });
    },
  });

  const updateListsPositions = useMutation({
    mutationFn: async ({ listsPayload, project_id }: { listsPayload: ListPositionPayload[]; project_id: number }) => {
      const res = await updateListsPositionsAction(listsPayload, project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ listsPayload, project_id }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", project_id] });

      const previousLists = queryClient.getQueryData<ListSelect[]>(["lists", project_id]);

      // Optimistically update the list with the new positions
      queryClient.setQueryData<ListSelect[]>(["lists", project_id], (old) =>
        old
          ? old.map((l) => {
              const payload = listsPayload.find((p) => p.id === l.id);
              return payload
                ? {
                    ...l,
                    position: payload.position,
                  }
                : l;
            })
          : old,
      );

      return { previousLists };
    },
    onSuccess: () => {
      // toast.success("Success", { description: "Successfully updated the list positions." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["lists", variables.project_id], context?.previousLists);
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lists", variables.project_id] });
    },
  });

  const updateListsStatus = useMutation({
    mutationFn: async ({
      new_done_list_id,
    }: {
      new_done_list_id: number;
    }) => {
      const res = await updateListsStatusAction(new_done_list_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ new_done_list_id }) => {
      await queryClient.cancelQueries({ queryKey: ["lists", project_id] });

      const previousLists = queryClient.getQueryData<ListSelect[]>(["lists", project_id]);
      const [oldIsDoneList] = previousLists?.filter((l) => l.isDone) ?? [];

      // Optimistically update the old and new list with their new status
      queryClient.setQueryData<ListSelect[]>(["lists", project_id], (old) =>
        old
          ? old.map((l) =>
              l.id === oldIsDoneList.id || l.id === new_done_list_id
                ? {
                    ...l,
                    isDone: l.id === new_done_list_id ? true : false,
                  }
                : l,
            )
          : old,
      );

      return { previousLists };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the list status." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["lists", project_id], context?.previousLists);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lists", project_id] });
    },
  });

  return {
    // Get Lists for a project
    lists: list.data,
    isLoadingLists: list.isLoading,
    loadingListError: list.isError,

    // Mutations
    createList: createList.mutate,
    isListCreateLoading: createList.isPending,
    createListError: createList.error,

    deleteList: deleteList.mutate,
    isListDeleteLoading: deleteList.isPending,
    deleteListError: deleteList.error,

    updateList: updateList.mutate,
    isListUpdateLoading: updateList.isPending,
    updateListError: updateList.error,

    updateListsPositions: updateListsPositions.mutate,
    isUpdateListsPositionsLoading: updateListsPositions.isPending,
    updateListsPositionsError: updateListsPositions.error,

    updateListsStatus: updateListsStatus.mutate,
    isUpdateListsStatusLoading: updateListsStatus.isPending,
    updateListsStatusError: updateListsStatus.error,
  };
}

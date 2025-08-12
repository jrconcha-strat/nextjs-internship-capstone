// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.4 - Implement optimistic UI updates for smooth interactions

/*
TODO: Implementation Notes for Interns:

Custom hook for task data management:
- Fetch tasks for a project
- Create new task
- Update task
- Delete task
- Move task between lists
- Bulk operations

Features:
- Optimistic updates for smooth UX
- Real-time synchronization
- Conflict resolution
- Undo functionality
- Batch operations

Example structure:
export function useTasks(projectId: string) {
  const queryClient = useQueryClient()
  
  const {
    data: tasks,
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => queries.tasks.getByProject(projectId),
    enabled: !!projectId
  })
  
  const createTask = useMutation({
    mutationFn: queries.tasks.create,
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId] })
      const previousTasks = queryClient.getQueryData(['tasks', projectId])
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) => [...old, { ...newTask, id: 'temp-' + Date.now() }])
      return { previousTasks }
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', projectId], context?.previousTasks)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    }
  })
  
  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    isCreating: createTask.isPending
  }
}
*/

// Placeholder to prevent import errors

"use client";
import { createTaskAction, getTasksByListIdAction } from "@/actions/task-actions";
import { taskSchemaForm } from "@/lib/validations/validations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export function useTasks(list_id: number) {
  const queryClient = useQueryClient();

  const getTaskByListId = useQuery({
    queryKey: ["tasks", list_id],
    enabled: typeof list_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, list_id] = queryKey as ["tasks", number];
      const res = await getTasksByListIdAction(list_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createTask = useMutation({
    mutationFn: async ({
      project_id,
      list_id,
      position,
      taskFormData,
    }: {
      project_id: number;
      list_id: number;
      position: number,
      taskFormData: z.infer<typeof taskSchemaForm>;
    }) => {
      const res = await createTaskAction(project_id, list_id, position, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Success", { description: "Successfully created the task." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  return {
    // Get list's tasks
    listTasks: getTaskByListId.data,
    isListTasksLoading: getTaskByListId.isPending,
    getListTasksError: getTaskByListId.error,

    // Create task
    createTask: createTask.mutate,
    isCreateTaskLoading: createTask.isPending,
    createTaskError: createTask.error,
  };
}

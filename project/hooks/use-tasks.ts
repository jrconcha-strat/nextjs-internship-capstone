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
import {
  createTaskAction,
  deleteTaskAction,
  getTaskByIdAction,
  getTaskMembersAction,
  getTasksByListIdAction,
  updateTaskAction,
} from "@/actions/task-actions";
import { getTempId } from "@/lib/utils";
import { taskSchemaForm } from "@/lib/validations/validations";
import { TaskSelect } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export function useTasks({ list_id, task_id }: { list_id?: number; task_id?: number }) {
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

  const getTaskById = useQuery({
    queryKey: ["task", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["task", number];
      const res = await getTaskByIdAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getTaskMembers = useQuery({
    queryKey: ["task_members", task_id],
    enabled: typeof task_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, task_id] = queryKey as ["tasks_members", number];
      const res = await getTaskMembersAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createTask = useMutation({
    mutationFn: async ({
      list_id,
      position,
      taskFormData,
    }: {
      list_id: number;
      position: number;
      taskFormData: z.infer<typeof taskSchemaForm>;
    }) => {
      const res = await createTaskAction(list_id, position, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ list_id, position, taskFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });

      const previousTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);

      const tempId = getTempId();

      // Build an optimistic task
      const now = new Date();

      // Same as server action createTask
      const optimisticTask: TaskSelect = {
        id: tempId,
        title: taskFormData.title,
        description: taskFormData.description,
        listId: list_id,
        priority: taskFormData.priority,
        dueDate: taskFormData.dueDate,
        position: position,
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) => (old ? [...old, optimisticTask] : old));

      return { previousTasks, tempId };
    },
    onSuccess: (createdTask, variables, context) => {
      toast.success("Success", { description: "Successfully created the task." });

      // We replace optimistic task with the tempId with the server-sourced task with actual id
      queryClient.setQueryData<TaskSelect[]>(
        ["tasks", list_id],
        (old) => old?.map((t) => (t.id === context.tempId ? createdTask : t)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async ({ task_id }: { task_id: number }) => {
      const res = await deleteTaskAction(task_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });

      const previousTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);

      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) => (old ? old.filter((t) => t.id != task_id) : old));

      return { previousTasks };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the task." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({
      task_id,
      taskFormData,
    }: {
      task_id: number;
      taskFormData?: z.infer<typeof taskSchemaForm>;
    }) => {
      const res = await updateTaskAction(task_id, taskFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ task_id, taskFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", list_id] });

      const previousTasks = queryClient.getQueryData<TaskSelect[]>(["tasks", list_id]);

      // Optimistically update the task with the inputted taskFormData
      queryClient.setQueryData<TaskSelect[]>(["tasks", list_id], (old) =>
        old ? old.map((p) => (p.id === task_id ? (p = { ...p, ...taskFormData }) : p)) : old,
      );

      return { previousTasks };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the task." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["tasks", list_id], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", list_id] });
      queryClient.invalidateQueries({ queryKey: ["task_members", task_id] });
    },
  });

  return {
    // Get list's tasks
    listTasks: getTaskByListId.data,
    isListTasksLoading: getTaskByListId.isPending,
    getListTasksError: getTaskByListId.error,

    // Get members assigned to task
    taskMembers: getTaskMembers.data,
    isTaskMembersLoading: getTaskMembers.isLoading,
    getTaskMembersError: getTaskMembers.isError,

    // Task by Id
    task: getTaskById.data,
    isTaskLoading: getTaskById.isLoading,
    taskError: getTaskById.error,

    // Create task
    createTask: createTask.mutate,
    isCreateTaskLoading: createTask.isPending,
    createTaskError: createTask.error,

    // Delete Task
    deleteTask: deleteTask.mutate,
    isDeleteTaskLoading: deleteTask.isPending,
    deleteTaskError: deleteTask.error,

    // Update Task
    updateTask: updateTask.mutate,
    isUpdateTaskLoading: updateTask.isPending,
    updateTaskError: updateTask.error,
  };
}

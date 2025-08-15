// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.2 - Create project listing and dashboard interface

/*
TODO: Implementation Notes for Interns:

Custom hook for project data management:
- Fetch projects list
- Create new project
- Update project
- Delete project
- Search/filter projects
- Pagination

Features:
- React Query/SWR for caching
- Optimistic updates
- Error handling
- Loading states
- Infinite scrolling (optional)

Example structure:
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProjects() {
  const queryClient = useQueryClient()
  
  const {
    data: projects,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => queries.projects.getAll()
  })
  
  const createProject = useMutation({
    mutationFn: queries.projects.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
  
  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutate,
    isCreating: createProject.isPending
  }
}

Dependencies to install:
- @tanstack/react-query (recommended)
- OR swr (alternative)
*/

// Placeholder to prevent import errors

"use client";
import {
  createProjectAction,
  deleteProjectAction,
  getAllMembersForProject,
  getProjectByIdAction,
  getProjectsForUserAction,
  updateProjectAction,
} from "@/actions/project-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectSchemaForm, projectSchemaUpdateForm } from "../lib/validations/validations";
import z from "zod";
import { toast } from "sonner";
import { getUserId } from "@/actions/user-actions";
import { getTasksCountForProjectAction } from "@/actions/task-actions";
import { ProjectSelect } from "@/types";
import { getTempId } from "@/lib/utils";

// Projects list
export function useProjects(project_id?: number) {
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const me = await getUserId();
      if (!me.success) throw new Error(me.message);
      const res = await getProjectsForUserAction(me.data.id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const taskCount = useQuery({
    queryKey: ["task_count", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["task_count", number];
      const res = await getTasksCountForProjectAction(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const getProjectById = useQuery({
    queryKey: ["project", project_id],
    enabled: typeof project_id === "number",
    queryFn: async ({ queryKey }) => {
      const [, project_id] = queryKey as ["project", number];
      const res = await getProjectByIdAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const createProject = useMutation({
    mutationFn: async (projectFormData: z.infer<typeof projectSchemaForm>) => {
      const res = await createProjectAction(projectFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (projectFormData: z.infer<typeof projectSchemaForm>) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      const tempId = getTempId();

      const res = await getUserId(); // Retrieve user's id
      if (!res.success) throw new Error(res.message);
      const ownerId = res.data.id;

      if (ownerId === undefined) throw new Error("Unable to get current user."); // Guard against undefined ownerId

      // Build an optimistic project
      const now = new Date();
      const optimisticProject: ProjectSelect = {
        id: tempId,
        name: projectFormData.name,
        description: projectFormData.description,
        ownerId: ownerId,
        dueDate: projectFormData.dueDate,
        status: "Planning",
        createdAt: now,
        updatedAt: now,
      };

      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) => (old ? [...old, optimisticProject] : old));

      return { previousProjects, tempId };
    },
    onSuccess: (createdProject, _vars, context) => {
      toast.success("Success", { description: "Successfully created the project." });

      // We replace optimistic project with the tempId with the server-sourced project with actual id
      queryClient.setQueryData<ProjectSelect[]>(
        ["projects"],
        (old) => old?.map((p) => (p.id === context.tempId ? createdProject : p)) ?? old,
      );
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (project_id: number) => {
      const res = await deleteProjectAction(project_id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async (project_id: number) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) =>
        old ? old.filter((p) => p.id != project_id) : old,
      );

      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully deleted the project." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({
      project_id,
      projectFormData,
    }: {
      project_id: number;
      projectFormData: z.infer<typeof projectSchemaUpdateForm>;
    }) => {
      const res = await updateProjectAction(project_id, projectFormData);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onMutate: async ({ project_id, projectFormData }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      const previousProjects = queryClient.getQueryData<ProjectSelect[]>(["projects"]);

      // Optimistically update the team with the inputted projectFormData
      queryClient.setQueryData<ProjectSelect[]>(["projects"], (old) =>
        old
          ? old.map((p) =>
              p.id === project_id
                ? {
                    ...p,
                    ...projectFormData,
                  }
                : p,
            )
          : old,
      );

      return { previousProjects };
    },
    onSuccess: () => {
      toast.success("Success", { description: "Successfully updated the project." });
    },
    onError: (error, variables, context) => {
      toast.error("Error", { description: error.message });
      queryClient.setQueryData(["projects"], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project_id] });
    },
  });

  return {
    // Projects for user
    projects,
    isProjectsLoading,
    projectsError,

    // Project by Id
    project: getProjectById.data,
    isProjectLoading: getProjectById.isLoading,
    projectError: getProjectById.error,

    // Project's task count
    taskCount: taskCount.data,
    isTaskCountLoading: taskCount.isLoading,
    taskCountError: taskCount.error,

    // Mutations
    createProject: createProject.mutate,
    isProjectCreationLoading: createProject.isPending,
    projectCreationError: createProject.error,

    deleteProject: deleteProject.mutate,
    isProjectDeleteLoading: deleteProject.isPending,
    deleteProjectError: deleteProject.error,

    updateProject: updateProject.mutate,
    isProjectUpdateLoading: updateProject.isPending,
    updateProjectError: updateProject.error,
  };
}

// Members for *one* project
export function useProjectMembers(projectId: number) {
  const projectMembers = useQuery({
    queryKey: ["project_members", projectId],
    enabled: typeof projectId === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["project_members", number];
      const res = await getAllMembersForProject(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return {
    projectMembers: projectMembers.data,
    isProjectMembersLoading: projectMembers.isLoading,
    projectMembersError: projectMembers.error,
  };
}

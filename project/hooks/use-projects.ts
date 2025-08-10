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
import { createProjectAction, getAllMembersForProject, getAllProjects } from "@/actions/project-actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectSchemaForm } from "../lib/validations/validations";
import z from "zod";
import { toast } from "sonner";

// Projects list
export function useProjects() {
  const queryClient = useQueryClient();

  const {
    data: projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await getAllProjects();
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Success", { description: "Successfully created the project." });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  return {
    projects,
    isProjectsLoading,
    projectsError,
    createProject: createProject.mutate,
    isProjectCreationLoading: createProject.isPending,
    projectCreationError: createProject.error,
  };
}

// Members for *one* project
export function useProjectMembers(projectId: number) {
  const {
    data: members,
    isLoading: isMembersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ["project_members", projectId],
    enabled: typeof projectId === "number",
    queryFn: async ({ queryKey }) => {
      const [, id] = queryKey as ["project_members", number];
      const res = await getAllMembersForProject(id);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  return { members, isMembersLoading, membersError };
}

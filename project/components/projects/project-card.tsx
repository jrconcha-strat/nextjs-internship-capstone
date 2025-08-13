"use client";

import { useProjectMembers, useProjects } from "@/hooks/use-projects";
import { formatDate, projectStatusColor } from "@/lib/utils";
import { ProjectSelect } from "@/types";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import ProjectOptions from "./project-options";
import UpdateProjectModal from "../modals/update-project-modal";
import { differenceInDays, isValid } from "date-fns";
import MembersAvatars from "../ui/members-avatars";
import { Skeleton } from "../ui/skeleton";

// TODO: Task 4.5 - Design and implement project cards and layouts
/*
TODO: Implementation Notes for Interns:

This component should display:
- Project name and description
- Progress indicator
- Team member count
- Due date
- Status badge
- Actions menu (edit, delete, etc.)

Props interface:
interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string
    progress: number
    memberCount: number
    dueDate?: Date
    status: 'active' | 'completed' | 'on-hold'
  }
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Hover effects
- Click to navigate to project board
- Responsive design
- Loading states
- Error states
*/

const projectsDummy = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of company website with modern design and improved UX",
    progress: 75,
    members: 5,
    dueDate: "2024-02-15",
    status: "In Progress",
    color: "bg-blue_munsell-500",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "iOS and Android app development for customer portal",
    progress: 45,
    members: 8,
    dueDate: "2024-03-20",
    status: "In Progress",
    color: "bg-green-500",
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 marketing campaign planning and execution",
    progress: 90,
    members: 3,
    dueDate: "2024-01-30",
    status: "Review",
    color: "bg-purple-500",
  },
  {
    id: "4",
    name: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    progress: 30,
    members: 4,
    dueDate: "2024-04-10",
    status: "Planning",
    color: "bg-orange-500",
  },
  {
    id: "5",
    name: "Security Audit",
    description: "Comprehensive security audit and vulnerability assessment",
    progress: 60,
    members: 2,
    dueDate: "2024-02-28",
    status: "In Progress",
    color: "bg-red-500",
  },
  {
    id: "6",
    name: "API Documentation",
    description: "Create comprehensive API documentation for developers",
    progress: 85,
    members: 3,
    dueDate: "2024-02-05",
    status: "Review",
    color: "bg-indigo-500",
  },
];

interface ProjectCardProps {
  project: ProjectSelect;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const { members, isMembersLoading, membersError } = useProjectMembers(project.id);
  const { taskCount, isTaskCountLoading, taskCountError } = useProjects(project.id);

  const [isEditModalOpen, setIsModalOpen] = useState(false);
  const daysLeft =
    project.dueDate && isValid(new Date(project.dueDate))
      ? differenceInDays(new Date(project.dueDate), new Date())
      : null;

  return (
    <>
      {isEditModalOpen && (
        <UpdateProjectModal projectData={project} isModalOpen={isEditModalOpen} setIsModalOpen={setIsModalOpen} />
      )}
      <Link href={`projects/${project.id}`}>
        <div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6 hover:shadow-lg transition-shadow">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500 mb-2">{project.name}</h3>
            <ProjectOptions project_id={project.id} setEditModalOpen={setIsModalOpen} />
          </div>

          <p className="text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4 line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center justify-between text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
            <div className="flex items-center">
              <Users size={16} className="mr-1" />

              {isMembersLoading
                ? "Loading"
                : !membersError && members
                  ? `${members.length === 0 ? "No" : members.length} members`
                  : "Unable to load members."}
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1" />
              {project.dueDate ? formatDate(project.dueDate) : "No Deadline Set"}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
            <span>
              {isTaskCountLoading
                ? "Loading"
                : taskCountError && !taskCount
                  ? "Unable to load task count"
                  : `${taskCount === 0 ? "No" : taskCount} tasks `}
            </span>

            <div className="text-sm text-payne's_gray-500 dark:text-french_gray-400">
              {daysLeft !== null
                ? daysLeft >= 0
                  ? `${daysLeft} days left`
                  : `${Math.abs(daysLeft)} days overdue`
                : "N/A"}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-payne's_gray-500 dark:text-french_gray-400">Progress</span>
              <span className="text-outer_space-500 dark:text-platinum-500 font-medium">
                {projectsDummy[0].progress}%
              </span>
            </div>
            <div className="w-full bg-french_gray-300 dark:bg-payne's_gray-400 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${projectsDummy[0].color}`}
                style={{ width: `${projectsDummy[0].progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${projectStatusColor[project.status]}`}>
              {project.status}
            </span>
            {isMembersLoading ? (
              <Skeleton height="6" width="20" />
            ) : members && !membersError ? (
              <MembersAvatars members={members} max_visible={5} size={6} />
            ) : (
              <p>Unable to load members.</p>
            )}
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProjectCard;

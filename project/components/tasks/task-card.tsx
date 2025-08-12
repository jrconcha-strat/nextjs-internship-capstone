// TODO: Task 5.6 - Create task detail modals and editing interfaces
"use client";
import { TaskSelect } from "@/types";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import MembersAvatars from "../ui/members-avatars";
import { FC } from "react";
import { capitalize, taskPriorityColor } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

/*
TODO: Implementation Notes for Interns:

This component should display:
- Task title and description
- Priority indicator
- Assignee avatar
- Due date
- Labels/tags
- Comments count
- Drag handle for reordering

Props interface:
interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    assignee?: User
    dueDate?: Date
    labels: string[]
    commentsCount: number
  }
  isDragging?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

Features to implement:
- Drag and drop support
- Click to open task modal
- Priority color coding
- Overdue indicators
- Responsive design
*/

type TaskCardProps = {
  task: TaskSelect;
};

const TaskCard: FC<TaskCardProps> = ({ task }) => {
  const { taskMembers, isTaskMembersLoading, getTaskMembersError } = useTasks({ task_id: task.id });
  return (
    <div className="p-4 bg-white dark:bg-outer_space-300 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 cursor-pointer hover:shadow-md transition-shadow">
      <h4 className="font-medium text-outer_space-500 dark:text-platinum-500 text-sm mb-2">{task.title}</h4>
      <p className="text-xs text-payne's_gray-500 dark:text-french_gray-400 mb-3">{task.description}</p>
      <div className="flex items-center justify-between">
        <Badge className={`${taskPriorityColor[task.priority]}`}>{capitalize(task.priority)}</Badge>
        {isTaskMembersLoading ? (
          <Skeleton className="w-24 h-5 rounded-md" />
        ) : taskMembers && !getTaskMembersError ? (
          taskMembers.length === 0 ? (
            <p className="text-xs text-dark-grey-100">None Assigned</p>
          ) : (
            <MembersAvatars members={taskMembers} max_visible={5} size={6} />
          )
        ) : (
          <p className="text-xs text-dark-grey-100">Unable to load members.</p>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

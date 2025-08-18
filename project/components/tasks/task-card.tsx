// TODO: Task 5.6 - Create task detail modals and editing interfaces
"use client";
import { TaskSelect } from "@/types";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import MembersAvatars from "../ui/members-avatars";
import { FC, useState } from "react";
import { capitalize, taskPriorityColor } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";
import TaskOptions from "./task-options";
import UpdateTaskModal from "../modals/update-task-modal";

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
  list_id: number;
  project_id: number;
};

const TaskCard: FC<TaskCardProps> = ({ task, list_id, project_id }) => {
  const { taskMembers, isTaskMembersLoading, getTaskMembersError } = useTasks({ task_id: task.id });
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  return (
    <>
      {isEditModalOpen && (
        <UpdateTaskModal
          task_id={task.id}
          list_id={list_id}
          project_id={project_id}
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setEditModalOpen}
        />
      )}
      <div className="group mx-4 p-4 bg-white dark:bg-transparent  shadow-md rounded-lg border border-border cursor-pointer hover:shadow-lg transition-shadow">
        <div className="flex justify-between">
          <h4 className="font-medium text-foreground/85 text-sm mb-2">{task.title}</h4>
          <TaskOptions
            task_id={task.id}
            list_id={list_id}
            setEditModalOpen={() => setEditModalOpen(true)}
            className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300"
          />
        </div>

        <p className="text-xs text-foreground/65 mb-3">{task.description}</p>
        <div className="flex items-center justify-between">
          <Badge className={`${taskPriorityColor[task.priority]}`}>{capitalize(task.priority)}</Badge>
          {isTaskMembersLoading ? (
            <Skeleton height="5" width="24" />
          ) : taskMembers && !getTaskMembersError ? (
            taskMembers.length === 0 ? (
              <p className="text-xs text-foreground/65">None Assigned</p>
            ) : (
              <MembersAvatars members={taskMembers} max_visible={5} size={5} />
            )
          ) : (
            <p className="text-xs text-foreground/65">Unable to load members.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskCard;

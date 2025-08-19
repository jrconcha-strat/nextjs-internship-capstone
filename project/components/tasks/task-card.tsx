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
import { Calendar, MessageCircleMore } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "../../lib/utils";
import { DragButton } from "../ui/drag-button";
import { useSortable } from "@dnd-kit/sortable";

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
  isOverlay?: boolean;
};

export type TaskType = "task";

export interface TaskDragData {
  type: TaskType;
  task: TaskSelect;
}

const TaskCard: FC<TaskCardProps> = ({ task, list_id, project_id, isOverlay }) => {
  const { taskMembers, isTaskMembersLoading, getTaskMembersError } = useTasks({ task_id: task.id });
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return <Card ref={setNodeRef} style={style} className={`group p-0 gap-0 min-h-[185px]`}></Card>;
  }
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
      <Card ref={setNodeRef} style={style} className={`group p-0 gap-0 `}>
        <CardHeader className="px-1 py-2 justify-between items-center flex flex-row border-b-2 border-secondary relative">
          {/* Drag Button, Options Button */}
          <DragButton listeners={listeners} attributes={attributes} />
          <TaskOptions
            task_id={task.id}
            project_id={project_id}
            list_id={list_id}
            setEditModalOpen={() => setEditModalOpen(true)}
            className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-300"
          />
        </CardHeader>
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            {/* Title, Priority, Description */}
            <div className="flex justify-between">
              <p className="font-medium text-foreground/85 text-sm">{task.title}</p>
              <Badge className={`${taskPriorityColor[task.priority]}`}>{capitalize(task.priority)}</Badge>
            </div>
            <div className="flex justify-between">
              <p className="text-xs text-foreground/65">{task.description}</p>
            </div>

            {/* Comments Count and Due Date */}
            <div className="flex justify-between items-center mt-2">
              <div className="flex justify-between gap-4">
                <div className="inline-flex gap-1">
                  <MessageCircleMore size={14} className="text-foreground/65" />
                  <p className="font-base text-muted-foreground text-xs  "> 14</p>
                </div>
                <div className="inline-flex gap-1">
                  <Calendar size={14} className="text-foreground/65" />
                  <p className="font-base text-muted-foreground text-xs ">
                    {" "}
                    {task.dueDate ? `${formatDate(task.dueDate)}` : "No due date"}{" "}
                  </p>
                </div>
              </div>

              {/* Assignee Members */}
              <div className="flex items-center justify-end">
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
            {/* Placeholder Labels */}
            <div className="flex gap-1.5">
              {["Late", "Frontend", "Documentation"].map((l, idx) => (
                <Badge key={idx} className="text-[9px]">
                  {l}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TaskCard;

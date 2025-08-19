// TODO: Task 4.4 - Build task creation and editing functionality
// TODO: Task 5.6 - Create task detail modals and editing interfaces

/*
TODO: Implementation Notes for Interns:

Modal for creating and editing tasks.

Features to implement:
- Task title and description
- Priority selection
- Assignee selection
- Due date picker
- Labels/tags
- Attachments
- Comments section (for edit mode)
- Activity history (for edit mode)

Form fields:
- Title (required)
- Description (rich text editor)
- Priority (low/medium/high)
- Assignee (team member selector)
- Due date (date picker)
- Labels (tag input)
- Attachments (file upload)

Integration:
- Use task validation schema
- Call task creation/update API
- Update board state optimistically
- Handle file uploads
- Real-time updates for comments
*/

"use client";
import { useTasks } from "@/hooks/use-tasks";
import { taskSchemaForm } from "@/lib/validations/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, X } from "lucide-react";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { priorityTuple } from "@/lib/db/db-enums";
import { capitalize } from "../../lib/utils";
import MultiSelect from "../ui/multi-select";
import { useProjectMembers } from "@/hooks/use-projects";
import { TaskFormInput, TaskFormOutput } from "@/types";

type UpdateTaskModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  list_id: number;
  project_id: number;
  task_id: number;
};

const UpdateTaskModal: FC<UpdateTaskModalProps> = ({ isModalOpen, setIsModalOpen, list_id, project_id, task_id }) => {
  useEffect(() => {
    if (isModalOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add("overflow-hidden");
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    };
  }, [isModalOpen]);

  const { updateTask, isUpdateTaskLoading, taskMembers, task, isTaskLoading } = useTasks({
    list_id: list_id,
    task_id: task_id,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormInput, undefined, TaskFormOutput>({
    resolver: zodResolver(taskSchemaForm),
    defaultValues: {
      title: task?.title,
      description: task?.description,
      priority: task?.priority,
      dueDate: task?.dueDate ? task.dueDate.toISOString().slice(0, 10) : "",
      assigneeIds: taskMembers?.map((m) => m.id),
    },
  });
  const { projectMembers, isProjectMembersLoading, projectMembersError } = useProjectMembers(project_id);

  const onSubmit = async (values: TaskFormOutput) => {
    updateTask({ task_id, taskFormData: values });

    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
          onMouseDown={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">Update Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
                >
                  Task Name *
                </label>
                <input
                  type="text"
                  disabled={isUpdateTaskLoading || isTaskLoading}
                  className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                  placeholder="Enter task name"
                  {...register("title")}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                  placeholder="Task description"
                  {...register("description")}
                  disabled={isUpdateTaskLoading || isTaskLoading}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="Priority"
                  className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
                >
                  Priority *
                </label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      disabled={isUpdateTaskLoading || isTaskLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isUpdateTaskLoading ? "Loading..." : "Select"} />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityTuple.map((value) => (
                          <SelectItem key={value} value={value}>
                            {capitalize(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Assign Members
                </label>
                <Controller
                  name="assigneeIds"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={(projectMembers ?? []).map((m) => ({ label: m.name, value: m.id }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isProjectMembersLoading || isUpdateTaskLoading || isTaskLoading}
                      placeholder={isProjectMembersLoading ? "Loading project members..." : "Select Members to Assign"}
                      emptyText={
                        projectMembersError ? "Failed to load members" : "This project doesn't have any members yet."
                      }
                    />
                  )}
                />

                {errors.assigneeIds && <p className="text-red-500 text-sm mt-1">{errors.assigneeIds.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  disabled={isUpdateTaskLoading || isTaskLoading}
                  className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                  {...register("dueDate", {
                    setValueAs: (value: string | null) => {
                      if (value === "") {
                        // If user cleared the selected date, or did not select a value, pass null because dueDate is optional.
                        return null;
                      } else if (value) {
                        // If user selected a value, convert it to a date object for validation.
                        return new Date(value);
                      }
                    },
                  })} // Transform input string YYYY-MM-DD to desired date object before validation.
                />
                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdateTaskLoading || isTaskLoading}
                  className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdateTaskLoading || isTaskLoading}
                  className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
                >
                  {isUpdateTaskLoading ? (
                    <div className="flex gap-2">
                      <Loader2Icon className="animate-spin " /> Loading
                    </div>
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateTaskModal;

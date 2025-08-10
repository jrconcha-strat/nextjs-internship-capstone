"use client";
import { checkProjectNameUnique } from "@/actions/project-actions";
import { useProjects } from "@/hooks/use-projects";
import { projectSchemaForm } from "@/lib/validations/validations";
import { ProjectFormInput, ProjectFormOutput, ProjectSelect } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, X } from "lucide-react";
import { FC, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

type UpdateProjectModalProps = {
  projectData: ProjectSelect;
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
};

const UpdateProjectModal: FC<UpdateProjectModalProps> = ({ projectData, isModalOpen, setIsModalOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the clicked element is not a child of modal, close modal.
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  // Disable scrolling when modal is open.
  useEffect(() => {
    if (isModalOpen) {
      // Account for layout shift due to hiding the scrollbar. Usually 15px
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add("overflow-hidden");
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    }
    // Cleanup function on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    };
  }, [isModalOpen]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProjectFormInput, never, ProjectFormOutput>({
    resolver: zodResolver(projectSchemaForm),
    defaultValues: {
      name: projectData.name,
      description: projectData.description,
      dueDate: projectData.dueDate ? projectData.dueDate.toISOString().slice(0, 10) : "",
    },
  });

  const { updateProject, isProjectUpdateLoading } = useProjects();

  const onSubmit = async (values: ProjectFormOutput) => {
    // Check if name values has changed.
    if (values.name !== projectData.name) {
      // Check if project name is unique.
      const checkProjectNameUniqueResult = await checkProjectNameUnique(values.name);
      // Unable to check for uniqueness | Project name is not unique
      if (
        !checkProjectNameUniqueResult.success ||
        (checkProjectNameUniqueResult.success && !checkProjectNameUniqueResult.data)
      ) {
        setError("name", {
          type: "manual",
          message: checkProjectNameUniqueResult.message,
        });
        return;
      }
    }

    updateProject({
      project_id: projectData.id,
      projectFormData: values,
    });
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div ref={modalRef} className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">Update Project</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  disabled={isProjectUpdateLoading}
                  className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                  placeholder="Enter project name"
                  {...register("name")}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg bg-white dark:bg-outer_space-400 text-outer_space-500 dark:text-platinum-500 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                  placeholder="Project description"
                  {...register("description")}
                  disabled={isProjectUpdateLoading}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  disabled={isProjectUpdateLoading}
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
                  disabled={isProjectUpdateLoading}
                  className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProjectUpdateLoading}
                  className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
                >
                  {isProjectUpdateLoading ? (
                    <div className="flex gap-2">
                      <Loader2Icon className="animate-spin " /> Loading
                    </div>
                  ) : (
                    "Update Project"
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

export default UpdateProjectModal;

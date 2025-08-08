"use client";
import { createProject } from "@/actions/project-actions";
// TODO: Task 4.1 - Implement project CRUD operations
// TODO: Task 4.4 - Build task creation and editing functionality
import { projectSchemaForm } from "@/lib/validations/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, X } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

/*
TODO: Implementation Notes for Interns:

Modal for creating new projects with form validation.

Features to implement:
- Form with project name, description, due date
- Zod validation
- Error handling
- Loading states
- Success feedback
- Team member assignment
- Project template selection

Form fields:
- Name (required)
- Description (optional)
- Due date (optional)
- Team members (optional)
- Project template (optional)
- Privacy settings

Integration:
- Use project validation schema from lib/validations.ts
- Call project creation API
- Update project list optimistically
- Handle errors gracefully
*/

type CreateProjectModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
};

const CreateProjectModal: FC<CreateProjectModalProps> = ({ isModalOpen, setIsModalOpen }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If the clicked element is not a child of modal, close modal.
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(!isModalOpen);
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
    formState: { errors },
  } = useForm<z.infer<typeof projectSchemaForm>>({
    resolver: zodResolver(projectSchemaForm),
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof projectSchemaForm>) => {
    setIsLoading(true);

    const result = await createProject(values);
    if (!result.success) {
      toast.error("Error", { description: result.message });
      setIsLoading(false);
      return;
    }

    toast.success("Success", { description: result.message });
    setIsModalOpen(false);
    setIsLoading(false);
  };
  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45">
          <div ref={modalRef} className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">Create New Project</h3>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  disabled={isLoading}
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
                  disabled={isLoading}
                  className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex gap-2">
                      <Loader2Icon className="animate-spin " /> Loading
                    </div>
                  ) : (
                    "Create Project"
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

export default CreateProjectModal;

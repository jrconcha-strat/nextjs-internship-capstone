"use client";
import { FC, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { listSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { Loader2Icon, XIcon } from "lucide-react";
import { useLists } from "@/hooks/use-lists";
import { Button } from "../ui/button";

type UpdateKanbanModalProps = {
  list_name: string;
  list_id: number;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
};

const UpdateKanbanModal: FC<UpdateKanbanModalProps> = ({
  list_name,
  list_id,
  isModalOpen,
  setIsModalOpen,
}) => {
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

  // Form Handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof listSchemaForm>>({
    resolver: zodResolver(listSchemaForm),
    defaultValues: {
      name: list_name,
    },
  });

  const { updateList, isListUpdateLoading } = useLists();

  // Will only run if there is no zod validation errors.
  const onSubmit = async (values: z.infer<typeof listSchemaForm>) => {
    updateList({ list_id, listFormData: values });
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
          onMouseDown={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full mx-4 md:mx-0 max-w-md shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-grey-600 dark:text-gray-100">Update Column</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover: " aria-label="Close">
                <XIcon className="text-dark-grey-600 w-full h-full" />
              </button>
            </div>
            {/* Form */}
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="name" className="mb-2">
                {" "}
                Label
              </label>
              <input id="name" className="outline-1 px-2 rounded-sm " {...register("name")}></input>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isListUpdateLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isListUpdateLoading}>
                  {isListUpdateLoading ? (
                    <div className="flex gap-2">
                      <Loader2Icon className="animate-spin " /> Loading
                    </div>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateKanbanModal;

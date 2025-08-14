"use client";
import { FC, useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { teamSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { Loader2Icon, XIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { checkTeamNameUnique } from "@/actions/teams-actions";
import { useTeams } from "@/hooks/use-teams";

type TeamModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
};

const CreateTeamModal: FC<TeamModalProps> = ({ isModalOpen, setIsModalOpen }) => {
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
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof teamSchemaForm>>({
    resolver: zodResolver(teamSchemaForm),
  });

  const { createTeam, isTeamCreateLoading } = useTeams();
  const { user } = useUser();

  if (!user) return null;

  // Will only run if there is no zod validation errors.
  const onSubmit = async (values: z.infer<typeof teamSchemaForm>) => {
    // Check if Team name is unique among active teams.
    const result = await checkTeamNameUnique(values.teamName);
    // Unable to check for uniqueness | Team name is not unique
    if (!result.success || (result.success && !result.data)) {
      setError("teamName", {
        type: "manual",
        message: result.message,
      });
      return;
    }

    createTeam(values.teamName);
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
              <h2 className="text-xl font-semibold text-dark-grey-600 dark:text-gray-100">Create a New Team</h2>
              <button onClick={() => setIsModalOpen(!isModalOpen)} className="hover: " aria-label="Close">
                <XIcon className="text-dark-grey-600 w-full h-full" />
              </button>
            </div>
            {/* Form */}
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="teamName" className="mb-2">
                {" "}
                Team Name
              </label>
              <input id="teamName" className="outline-1 px-2 rounded-sm " {...register("teamName")}></input>
              {errors.teamName && <p className="text-red-500 text-sm mt-1">{errors.teamName.message}</p>}
              <div className="w-full flex justify-end mt-4">
                {isTeamCreateLoading ? (
                  <div className="bg-emerald-400 rounded-sm text-white w-[100px] flex items-center justify-center px-2 py-1 gap-2 ">
                    {" "}
                    <Loader2Icon className="animate-spin" /> Loading{" "}
                  </div>
                ) : (
                  <input className="bg-emerald-400 text-white  rounded-sm w-[100px]" type="submit" />
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTeamModal;

"use client";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { updateTeam } from "@/actions/teams-actions";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { TeamsSelect } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type TeamNameProps = {
  teamData: TeamsSelect;
};

const TeamName: FC<TeamNameProps> = ({ teamData }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onEditClick = () => {
    setIsEditingName(true);
  };

  const onCancelClick = () => {
    setIsEditingName(false);
  };

  // Form Handling
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof teamSchemaForm>>({
    resolver: zodResolver(teamSchemaForm),
    defaultValues: {
      teamName: teamData.teamName,
    },
  });

  // Will only run if there is no zod validation errors.
  const onSubmit = async (values: z.infer<typeof teamSchemaForm>) => {
    setIsLoading(true);

    if (values.teamName === teamData.teamName) {
      setError("teamName", {
        type: "manual",
        message: "Can't rename to your own name. Please choose another name.",
      });
      setIsLoading(false);
      return;
    }

    const response = await updateTeam(teamData.id, values.teamName);
    if (!response.success) {
      toast.error("Errors", { description: response.message });
      return;
    }

    toast.success("Success", { description: response.message });
    setIsLoading(false);
    setIsEditingName(false);
  };
  return (
    <div className="flex w-full justify-between">
      {isEditingName ? (
        <>
          {/* Modal */}{" "}
          <div className="flex flex-col gap-2">
            <form
              className="flex flex-col  w-full gap-y-3 md:gap-y-0 md:flex-row gap-x-3"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input id="teamName" className="outline-1 px-2 rounded-sm" {...register("teamName")}></Input>
              <div className="w-full flex justify-between gap-x-3">
                <Button onClick={onCancelClick} variant={"secondary"} className="flex-1 md:w-[100px]">
                  Cancel
                </Button>

                {isLoading ? (
                  <div className="flex-1 bg-emerald-400 rounded-sm text-white md:w-[100px] flex items-center justify-center px-2 py-1 gap-2">
                    <Loader2Icon className="animate-spin" /> Loading
                  </div>
                ) : (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    className="flex-1 text-white bg-emerald-500 hover:bg-emerald-300 transition-all duration-150 md:w-[100px]"
                  >
                    Rename
                  </Button>
                )}
              </div>
            </form>
            {errors.teamName && <p className="text-red-500 text-sm">{errors.teamName.message}</p>}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-dark-grey-600 dark:text-gray-100">{teamData.teamName}</h2>
          <button
            onClick={onEditClick}
            className="text-xs text-emerald-600 underline hover:text-emerald-300 transition-all duration-150"
          >
            Edit
          </button>
        </>
      )}
    </div>
  );
};

export default TeamName;

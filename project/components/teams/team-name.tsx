"use client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamSchemaForm } from "@/lib/validations/validations";
import z from "zod";
import { Loader2Icon } from "lucide-react";
import { TeamsSelect } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTeams } from "@/hooks/use-teams";
import { Label } from "../ui/label";

type TeamNameProps = {
  teamData: TeamsSelect;
};

const TeamName: FC<TeamNameProps> = ({ teamData }) => {
  const { updateTeam, isTeamUpdateLoading } = useTeams(teamData.id);

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
    if (values.teamName === teamData.teamName) {
      setError("teamName", {
        type: "manual",
        message: "Can't rename to your own name. Please choose another name.",
      });
      return;
    }

    updateTeam({ team_id: teamData.id, teamFormData: values });
  };
  return (
    <div className="flex w-full justify-between">
      <>
        {/* Modal */}{" "}
        <div className="flex flex-col gap-2">
          <form className="flex flex-col w-full gap-y-3" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="teamName">Team Name:</Label>
            <div className="w-full flex justify-between gap-x-3">
              <Input id="teamName" className="outline-1 px-2 rounded-sm" {...register("teamName")}></Input>
              {isTeamUpdateLoading ? (
                <div className="flex-1 bg-emerald-400 rounded-sm text-white flex items-center justify-center px-2 py-1 gap-2">
                  <Loader2Icon className="animate-spin" /> Loading
                </div>
              ) : (
                <Button
                  onClick={handleSubmit(onSubmit)}
                  className="flex-1 text-white text-xs bg-emerald-500 hover:bg-emerald-300 transition-all duration-150"
                >
                  Rename
                </Button>
              )}
            </div>
          </form>
          {errors.teamName && <p className="text-red-500 text-sm">{errors.teamName.message}</p>}
        </div>
      </>
    </div>
  );
};

export default TeamName;

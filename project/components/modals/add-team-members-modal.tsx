"use client";
import { addMembersSchemaForm } from "@/lib/validations/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, X } from "lucide-react";
import { FC, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import MultiSelect from "../ui/multi-select";
import { useTeams } from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";

type AddTeamMembersModalProps = {
  isModalOpen: boolean;
  closeModal: () => void;
  team_id: number;
};

const AddTeamMembersModal: FC<AddTeamMembersModalProps> = ({ isModalOpen, closeModal, team_id }) => {
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
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.infer<typeof addMembersSchemaForm>>({
    resolver: zodResolver(addMembersSchemaForm),
    defaultValues: {
      user_Ids: [],
    },
  });

  const { users, isUsersLoading, getUsersError } = useUsers();
  const { addUsersToTeam, isAddingUsersToTeamLoading, teamMembers, isTeamMembersLoading, teamMembersError } =
    useTeams(team_id);

  // This just returns a set of user ids.
  const memberIds = useMemo(() => new Set((teamMembers ?? []).map((m) => m.id ?? m.id)), [teamMembers]);

  // Here we retrieve users that are not already team members.
  const availableUsers = useMemo(() => (users ?? []).filter((u) => !memberIds.has(u.id)), [users, memberIds]);

  const onSubmit = async (values: z.infer<typeof addMembersSchemaForm>) => {
    addUsersToTeam({ user_ids: values.user_Ids, team_id });

    closeModal();
  };

  // If error, throw error
  if (getUsersError) {
    throw new Error("Unable to retrieve users data.");
  }

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onMouseDown={closeModal}>
          <div
            className="bg-white dark:bg-outer_space-500 rounded-lg p-6 w-full max-w-md mx-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">Add Members To Team</h3>
              <button onClick={closeModal} className="p-1 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-outer_space-500 dark:text-platinum-500 mb-2">
                  Assign Members
                </label>
                <Controller
                  name="user_Ids"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      options={(availableUsers ?? []).map((u) => ({ label: u.name, value: u.id }))}
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isUsersLoading || isAddingUsersToTeamLoading}
                      placeholder={isUsersLoading ? "Loading users" : "Select users to add"}
                      emptyText={isUsersLoading ? "Failed to load users" : "No more users to add"}
                    />
                  )}
                />

                {errors.user_Ids && <p className="text-red-500 text-sm mt-1">{errors.user_Ids.message}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isAddingUsersToTeamLoading}
                  className="px-4 py-2 text-payne's_gray-500 dark:text-french_gray-400 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingUsersToTeamLoading}
                  className="px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
                >
                  {isAddingUsersToTeamLoading ? (
                    <div className="flex gap-2">
                      <Loader2Icon className="animate-spin " /> Loading
                    </div>
                  ) : (
                    "Add Members"
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

export default AddTeamMembersModal;

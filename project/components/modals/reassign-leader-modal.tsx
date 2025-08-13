// components/teams/reassign-leader-modal.tsx
"use client";

import { FC, useEffect } from "react";
import { XIcon, Loader2Icon, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ReassignLeaderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  team_id: number;
  new_leader_id: number;
  current_leader_id: number;
  reAssignLeader: ({
    old_leader_id,
    new_leader_id,
    team_id,
  }: {
    old_leader_id: number;
    new_leader_id: number;
    team_id: number;
  }) => void;
  isReassignLoading: boolean;
};

const ReassignLeaderModal: FC<ReassignLeaderModalProps> = ({
  isOpen,
  onClose,
  team_id,
  new_leader_id,
  current_leader_id,
  reAssignLeader,
  isReassignLoading,
}) => {
  // Lock scroll when modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add("overflow-hidden");
    document.body.style.paddingRight = `${scrollBarWidth}px`;
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    reAssignLeader({ old_leader_id: current_leader_id, new_leader_id: new_leader_id, team_id });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" onMouseDown={onClose}>
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full mx-4 md:mx-0 max-w-md shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-dark-grey-600 dark:text-gray-100">Are you sure?</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <XIcon className="text-dark-grey-600 dark:text-gray-100 h-5 w-5" />
          </button>
        </div>

        <Separator />

        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            This member will become the new Team Leader. You’ll lose leader privileges after reassignment.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isReassignLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isReassignLoading}>
            {isReassignLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Reassigning…
              </div>
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReassignLeaderModal;

// components/teams/reassign-leader-modal.tsx
"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { XIcon, Loader2Icon, Crown } from "lucide-react";
import { UserSelect } from "@/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTeams } from "@/hooks/use-teams";

type ReassignLeaderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  team_id: number;
  teamMembers: UserSelect[];
  currentLeaderId: number;
};

const ReassignLeaderModal: FC<ReassignLeaderModalProps> = ({
  isOpen,
  onClose,
  team_id,
  teamMembers,
  currentLeaderId,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { reassignTeamLeader, isReassignTeamLeaderLoading } = useTeams();

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

  // reset selection each open
  useEffect(() => {
    if (isOpen) setSelectedUserId(null);
  }, [isOpen]);

  // members eligible to become leader (exclude current leader)
  const eligibleMembers = useMemo(
    () => teamMembers.filter((m) => (currentLeaderId ? m.id !== currentLeaderId : true)),
    [teamMembers, currentLeaderId],
  );

  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Error", { description: "Please select a member." });
      return;
    }

    reassignTeamLeader({ old_leader_id: currentLeaderId, new_leader_id: selectedUserId, team_id });
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
            <h2 className="text-xl font-semibold text-dark-grey-600 dark:text-gray-100">Reassign Team Leader</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <XIcon className="text-dark-grey-600 dark:text-gray-100 h-5 w-5" />
          </button>
        </div>

        <Separator />

        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Select a member to become the new Team Leader. You’ll lose leader privileges after reassignment.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Member</label>
            <Select
              disabled={isReassignTeamLeaderLoading || eligibleMembers.length === 0}
              onValueChange={(val) => setSelectedUserId(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder={eligibleMembers.length ? "Select a member…" : "No eligible members"} />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    <div className="flex flex-col">
                      <span className="text-sm">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isReassignTeamLeaderLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isReassignTeamLeaderLoading || !selectedUserId}>
            {isReassignTeamLeaderLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Reassigning…
              </div>
            ) : (
              "Reassign"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReassignLeaderModal;

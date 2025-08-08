"use client";
import { FC, useEffect, useState } from "react";
import { UserSelect } from "@/types";
import { getAllUsers } from "@/actions/user-actions";
import { addUsersToTeam } from "@/actions/teams-actions";
import { toast } from "sonner";

type AddUsersToTeamProps = {
  teamMembers: UserSelect[];
  team_id: number;
};

const AddUsersToTeam: FC<AddUsersToTeamProps> = ({ teamMembers, team_id }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSelect[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      }
    };

    fetchUsers();
  }, []); // Added dependency to only run on mount

  // Filter users based on search term and exclude users already in the team
  const filteredUsers = users
    .filter((user) => !teamMembers.some((teamMember) => teamMember.id === user.id)) // Exclude already selected users
    .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase())); // Apply search filter

  // Handle selecting or deselecting users
  const handleCheckboxChange = (user: UserSelect) => {
    setSelectedUsers(
      (prevSelected) =>
        prevSelected.some((selectedUser) => selectedUser.id === user.id)
          ? prevSelected.filter((selectedUser) => selectedUser.id !== user.id) // Deselect
          : [...prevSelected, user], // Select
    );
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle adding selected users to the team
  const handleAddUsers = async () => {
    // Extract the IDs of selected users and pass them to the onAddUsers function
    const selectedUserIds = selectedUsers.map((user) => user.id);
    const response = await addUsersToTeam(selectedUserIds, team_id); // Pass only the IDs
    if (!response.success) {
      toast.error("Error", { description: response.message });
    }
    toast.success("Success", { description: response.message });
    setSelectedUsers([]); // Clear selection after adding
  };

  return (
    <div>
      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search users..."
        className="border p-2 rounded mb-4 w-full"
      />

      {/* List of Users with Checkboxes */}
      <div className="space-y-2 outline-1 p-4 overflow-y-scroll max-h-[200px]">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedUsers.some((selectedUser) => selectedUser.id === user.id)}
                onChange={() => handleCheckboxChange(user)}
                className="mr-2"
              />
              <span>{user.name}</span>
            </div>
          ))
        ) : (
          <div>No users available to be selected.</div> // Display message if no users match the search
        )}
      </div>

      {/* Add Users Button */}
      <button
        onClick={handleAddUsers}
        disabled={selectedUsers.length === 0}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Add Selected Users
      </button>
    </div>
  );
};

export default AddUsersToTeam;

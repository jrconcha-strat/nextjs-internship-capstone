"use client";
import { FC, useMemo, useState } from "react";
import TeamsSearchFilter from "./teams-search-filter";
import TeamsGrid from "./teams-grid";
import { TeamsSelect } from "@/types";

type TeamsProps = {
  teamsData: TeamsSelect[];
};
const TeamsSection: FC<TeamsProps> = ({ teamsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("Ascending (A-Z)");

  const filteredTeams = useMemo(() => {
    // Filter by search term
    let filtered = teamsData.filter((team) =>
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Sort based on filterOption
    switch (filterOption) {
      case "Ascending (A-Z)":
        filtered = filtered.sort((a, b) =>
          a.teamName.localeCompare(b.teamName),
        );
        break;
      case "Descending (Z-A)":
        filtered = filtered.sort((a, b) =>
          b.teamName.localeCompare(a.teamName),
        );
        break;
      case "Newest First":
        filtered = filtered.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;
      case "Oldest First":
        filtered = filtered.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        break;
    }

    return filtered;
  }, [searchTerm, filterOption, teamsData]);

  return (
    <div>
      <p className="text-xl font-bold mb-4 text-dark-grey-400"> Your Teams </p>
      {/* Search and Filter */}
      <div className="mb-4">
        <TeamsSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
        />
      </div>

      {/* Team Card Grid */}
      {teamsData.length === 0 ? (
        <div className="text-center text-sm text-dark-grey-400">
          <p>You are not in any teams right now.</p>
          <p>Create or get invited to one!</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center text-sm text-dark-grey-400">
          <p>No teams found with that name.</p>
        </div>
      ) : (
        <TeamsGrid teamsData={filteredTeams} />
      )}
    </div>
  );
};

export default TeamsSection;

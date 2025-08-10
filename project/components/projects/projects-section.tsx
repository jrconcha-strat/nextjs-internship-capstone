"use client";
import { FC, useMemo, useState } from "react";
import ProjectsSearchFilter from "./projects-search-filter";
import ProjectsGrid from "./project-grid";
import { ProjectSelect } from "@/types";

type ProjectsSectionProps = {
  projectsData: ProjectSelect[];
};
const ProjectsSection: FC<ProjectsSectionProps> = ({ projectsData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("Ascending (A-Z)");

  const filteredTeams = useMemo(() => {
    // Filter by search term
    let filtered = projectsData.filter((project) => project.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Sort based on filterOption
    switch (filterOption) {
      case "Ascending (A-Z)":
        filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Descending (Z-A)":
        filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Newest First":
        filtered = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "Oldest First":
        filtered = filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
    }

    return filtered;
  }, [searchTerm, filterOption, projectsData]);

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-4">
        <ProjectsSearchFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterOption={filterOption}
          setFilterOption={setFilterOption}
        />
      </div>

      {/* Project Card Grid */}
      {projectsData.length === 0 ? (
        <div className="flex justify-center text-center text-sm text-dark-grey-400">
          <p>You have no projects right now.</p>
          <p>Create or get invited to one!</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex justify-center text-center text-sm text-dark-grey-400">
          <p>No projects found with that name.</p>
        </div>
      ) : (
        <ProjectsGrid projects={filteredTeams} />
      )}
    </div>
  );
};

export default ProjectsSection;

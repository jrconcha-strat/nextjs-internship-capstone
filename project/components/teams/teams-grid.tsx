import { FC } from "react";
import { TeamsSelect } from "../../types/index";
import TeamsCard from "./teams-card";

type TeamsGridProps = {
  teamsData: TeamsSelect[];
};
const TeamsGrid: FC<TeamsGridProps> = ({ teamsData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {teamsData.map((team, index) => (
        <TeamsCard teamData={team} key={index} />
      ))}
    </div>
  );
};

export default TeamsGrid;

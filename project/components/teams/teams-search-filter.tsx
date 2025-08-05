import { Filter, Search } from "lucide-react";
import { FC } from "react";

type TeamsSearchFilterProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

const TeamsSearchFilter: FC<TeamsSearchFilterProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search for a team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-outer_space-500 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
        />
      </div>
      <button className="inline-flex items-center px-4 py-2 border border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 transition-colors">
        <Filter size={16} className="mr-2" />
        Filter
      </button>
    </div>
  );
};

export default TeamsSearchFilter;

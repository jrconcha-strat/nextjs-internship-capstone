import { Search } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";

type TasksSearchProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

const TasksSearch: FC<TasksSearchProps> = ({ searchTerm, setSearchTerm }) => {
  function clearSearch() {
    setSearchTerm("");
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
          size={16}
        />
        <input
          type="text"
          placeholder="Search for a task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-outer_space-500 border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
        />
      </div>
      <Button className="w-full md:w-max h-full" onClick={clearSearch}>Clear</Button>
    </div>
  );
};

export default TasksSearch;

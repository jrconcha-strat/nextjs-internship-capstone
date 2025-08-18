import { Search } from "lucide-react";
import { FC } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground" size={16} />
        <Input
          type="text"
          placeholder="Search for a task..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10"
        />
      </div>
      <Button variant="default" size="sm" className="w-full md:w-max h-full text-white p-1 px-2 hover:bg-primary"  onClick={clearSearch}>
        Clear
      </Button>
    </div>
  );
};

export default TasksSearch;

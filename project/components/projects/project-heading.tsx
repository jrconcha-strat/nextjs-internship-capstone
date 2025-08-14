import { ProjectSelect } from "@/types";
import { ArrowLeft, Calendar, MoreHorizontal, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";

type ProjectHeadingProps = {
  project: ProjectSelect;
};

const navigationItems = [
  { name: "Members", href: "members", icon: Users, current: false },
  { name: "Calendar", href: "calendar", icon: Calendar, current: false },
  { name: "Settings", href: "settings", icon: Settings, current: false },
];

const ProjectHeading: FC<ProjectHeadingProps> = ({ project }) => {
  const [navItems, setNavItems] = useState(navigationItems);
  const pathname = usePathname();

  useEffect(() => {
    // Determine which navItem is currently active.
    if (pathname) {
      const updated = navItems.map((item) => ({
        ...item,
        current: pathname.endsWith(item.href),
      }));
      setNavItems(updated);
    }
  }, [pathname]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link
          href="/projects"
          className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">{project.name}</h1>
          <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-1">
            Kanban board view for project management
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {navItems.map((itm, idx) => {
          return (
            <Link key={idx} href={`/projects/${project.id}/${itm.href}`}>
              <button
                className={`p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors ${
                  itm.current
                    ? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300"
                    : "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
                }`}
              >
                <itm.icon size={20} />
              </button>
            </Link>
          );
        })}
        <button className={`p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors`}>
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProjectHeading;

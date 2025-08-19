import { ProjectSelect } from "@/types";
import { ArrowLeft, Calendar, MoreHorizontal, PanelsTopLeft, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type ProjectHeadingProps = {
  project: ProjectSelect;
};

const ProjectHeading: FC<ProjectHeadingProps> = ({ project }) => {
  const navigationItems = [
    { name: "Default", href: `${project.id}`, icon: PanelsTopLeft, current: false },
    { name: "Members", href: "members", icon: Users, current: false },
    { name: "Calendar", href: "calendar", icon: Calendar, current: false },
    { name: "Settings", href: "settings", icon: Settings, current: false },
  ];

  const [navItems, setNavItems] = useState(navigationItems);
  const [isDefault, setDefault] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Determine which navItem is currently active.
    if (pathname) {
      const updated = navItems.map((item) => ({
        ...item,
        current: pathname.endsWith(item.href),
      }));
      setNavItems(updated);

      // Check if we're on default page
      const isOnDefaultPage = updated.find((n) => n.current && n.name === "Default") ? true : false;
      setDefault(isOnDefaultPage);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col gap-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {isDefault ? (
            <BreadcrumbItem>
              <BreadcrumbPage>{project.name}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{navItems.find((n) => n.current && n.name !== "Default")?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 md:gap-0 md:flex-row items-center justify-between">
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

        <div className="bg-primary/20 rounded-md px-1 md:bg-transparent flex items-center space-x-2">
          {navItems.map((itm, idx) => {
            return (
              <Link
                key={idx}
                href={itm.name === "Default" ? `/projects/${project.id}` : `/projects/${project.id}/${itm.href}`}
              >
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
    </div>
  );
};

export default ProjectHeading;

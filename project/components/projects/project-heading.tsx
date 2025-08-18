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
          <Link href="/projects" className="p-2 hover:bg-foreground/10 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-foreground/70 mt-1">Kanban board view for project management</p>
          </div>
        </div>

        <div className="bg-foreground/5 rounded-md px-1 md:bg-transparent flex items-center space-x-2">
          {navItems.map((itm, idx) => {
            return (
              <Link
                key={idx}
                href={itm.name === "Default" ? `/projects/${project.id}` : `/projects/${project.id}/${itm.href}`}
              >
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    itm.current ? "bg-primary text-white" : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
                  }`}
                >
                  <itm.icon size={20} />
                </button>
              </Link>
            );
          })}
          <button className={`p-2 text-foreground/70 hover:bg-foreground/10 hover:text-foreground rounded-lg transition-colors`}>
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeading;

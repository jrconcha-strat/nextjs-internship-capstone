import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { getRecentProjects } from "@/lib/api-calls";
import { formatDate, projectStatusColor } from "@/lib/utils";
import type { RecentProjects } from "@/types";

export default async function RecentProjectsCard() {
  const res = await getRecentProjects();

  if (!res.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
        <p className="text-foreground/50 text-base">Unable to load data.</p>
      </div>
    );
  }

  const projects = (res.data ?? []) as RecentProjects[];

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-y-2 bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
        <p className="text-foreground/50 text-base">No projects found.</p>
        <p className="text-foreground/50 text-base">Get invited to or create one.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500">Recent Projects</h3>
        <Link href="/projects" className="text-blue_munsell-500 hover:text-blue_munsell-600 text-sm font-medium">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <div className="border border-french_gray-300 dark:border-payne's_gray-400 rounded-lg p-4 hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-outer_space-500 dark:text-platinum-500">{project.name}</h4>
                  <p className="text-sm text-payne's_gray-500 dark:text-french_gray-400 mt-1">{project.description}</p>

                  <div className="flex justify-between">
                    <div className="flex items-center space-x-4 mt-3 text-sm text-payne's_gray-500 dark:text-french_gray-400">
                      <div className="flex items-center">
                        <Users size={16} className="mr-1" />
                        {project.memberCount}
                      </div>
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <p>{project.dueDate ? formatDate(project.dueDate) : "No due date."}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${projectStatusColor[project.status]}`}
                      >
                        {project.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress placeholder */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-payne's_gray-500 dark:text-french_gray-400">Progress</span>
                      <span className="text-outer_space-500 dark:text-platinum-500">66%</span>
                    </div>
                    <div className="w-full bg-french_gray-300 dark:bg-payne's_gray-400 rounded-full h-2">
                      <div
                        className="bg-blue_munsell-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `100%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import RecentProjectsCard from "@/components/projects/recent-projects";
import { TrendingUp, Users, CheckCircle, Clock, Plus, Loader2Icon } from "lucide-react";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">Dashboard</h1>
        <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-2">
          Welcome back! Here&apos;s an overview of your projects and tasks.
        </p>
      </div>

      {/* Implementation Status Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <div className="shrink-0">
            <div className="w-8 h-8 bg-blue_munsell-500 rounded-full flex items-center justify-center">
              <TrendingUp className="text-white" size={16} />
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Dashboard Implementation Tasks</h3>
            <div className="mt-2 text-sm text-blue-800 dark:text-blue-200">
              <ul className="list-disc list-inside space-y-1">
                <li>Task 4.2: Create project listing and dashboard interface</li>
                <li>Task 5.3: Set up client-side state management with Zustand</li>
                <li>Task 6.6: Optimize performance and implement loading states</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Placeholder */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Active Projects", value: "12", icon: TrendingUp, change: "+2.5%" },
          { name: "Team Members", value: "24", icon: Users, change: "+4.1%" },
          { name: "Completed Tasks", value: "156", icon: CheckCircle, change: "+12.3%" },
          { name: "Pending Tasks", value: "43", icon: Clock, change: "-2.1%" },
        ].map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-outer_space-500 overflow-hidden rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6"
          >
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue_munsell-100 dark:bg-blue_munsell-900 rounded-lg flex items-center justify-center">
                  <stat.icon className="text-blue_munsell-500" size={20} />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-payne's_gray-500 dark:text-french_gray-400 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-outer_space-500 dark:text-platinum-500">
                      {stat.value}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400">
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Suspense
          fallback={
            <div className="flex items-center justify-center gap-x-2  bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
              <Loader2Icon size={24} className="animate-spin text-muted-foreground" />
              <p className="text-base text-muted-foreground"> Loading </p>
            </div>
          }
        >
          {" "}
          <RecentProjectsCard />
        </Suspense>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6">
          <h3 className="text-lg font-semibold text-outer_space-500 dark:text-platinum-500 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center px-4 py-3 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors">
              <Plus size={20} className="mr-2" />
              Create New Project
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 transition-colors">
              <Plus size={20} className="mr-2" />
              Add Team Member
            </button>
            <button className="w-full flex items-center justify-center px-4 py-3 border border-french_gray-300 dark:border-payne's_gray-400 text-outer_space-500 dark:text-platinum-500 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 transition-colors">
              <Plus size={20} className="mr-2" />
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  Menu,
  X,
  BarChart3,
  Calendar,
  Bell,
  Search,
  Loader2Icon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, current: true },
  { name: "Projects", href: "/projects", icon: FolderOpen, current: false },
  { name: "Team", href: "/team", icon: Users, current: false },
  { name: "Analytics", href: "/analytics", icon: BarChart3, current: false },
  { name: "Calendar", href: "/calendar", icon: Calendar, current: false },
  { name: "Settings", href: "/settings", icon: Settings, current: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const [count, setCount] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navItems, setNavItems] = useState(navigation);
  const router = useRouter();

  const updateActiveNavigation = (navName: string) => {
    const updated = navItems.map((item) => ({
      ...item,
      current: item.name === navName,
    }));
    setNavItems(updated);
  };

  // Handle redirect countdown
  useEffect(() => {
    if (isLoaded && isSignedIn === false) {
      const interval = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        router.push("/sign-in");
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isLoaded, isSignedIn, router]);

  // Just display loading screen while waiting for clerk.
  if (!isLoaded) {
    return (
      <div className="w-full h-[100vh] flex justify-center items-center gap-x-2">
        {" "}
        <Loader2Icon size={24} className="animate-spin"></Loader2Icon>{" "}
        <p className="text-2xl"> Loading </p>
      </div>
    );
  }

  if (isLoaded && isSignedIn == false) {
    return (
      <div className="w-full h-[100vh] flex flex-col justify-center items-center gap-y-3">
        {" "}
        <p className="font-bold text-2xl">
          {`You must be signed in to view this page.`}
        </p>
        <p>{`Redirecting in ${count}`}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-platinum-900 dark:bg-outer_space-600">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-outer_space-500 border-r border-french_gray-300 dark:border-payne's_gray-400 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-french_gray-300 dark:border-payne's_gray-400">
          <Link href="/" className="text-2xl font-bold text-blue_munsell-500">
            ProjectFlow
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li
                onClick={() => updateActiveNavigation(item.name)}
                key={item.name}
              >
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-blue_munsell-100 dark:bg-blue_munsell-900 text-blue_munsell-700 dark:text-blue_munsell-300"
                      : "text-outer_space-500 dark:text-platinum-500 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
                  }`}
                >
                  <item.icon className="mr-3" size={20} />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-x-4 border-b border-french_gray-300 dark:border-payne's_gray-400 bg-white dark:bg-outer_space-500 px-4 shadow-xs sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400"
          >
            <Menu size={20} />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Search bar placeholder */}
            <div className="flex flex-1 items-center">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-payne's_gray-500 dark:text-french_gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search projects, tasks..."
                  className="w-full pl-10 pr-4 py-2 bg-platinum-500 dark:bg-payne's_gray-400 border border-french_gray-300 dark:border-payne's_gray-300 rounded-lg text-outer_space-500 dark:text-platinum-500 placeholder-payne's_gray-500 dark:placeholder-french_gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue_munsell-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="p-2 rounded-lg hover:bg-platinum-500 dark:hover:bg-payne's_gray-400">
                <Bell size={20} />
              </button>
              <ThemeToggle />
              <UserButton />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="w-full h-[100vh] flex justify-center items-center gap-x-2">
                {" "}
                <Loader2Icon
                  size={24}
                  className="animate-spin"
                ></Loader2Icon>{" "}
                <p className="text-2xl"> Loading </p>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

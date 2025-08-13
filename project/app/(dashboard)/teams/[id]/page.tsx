"use client";
import { useTeams } from "@/hooks/use-teams";
import { ArrowLeft, Mail, MoreHorizontal, Users } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
  const { userTeams, isUserTeamsLoading, getUserTeamsError } = useTeams();

  return (
    <div className="space-y-6">
      {/* Teams Heading */}
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div className="flex items-center space-x-4">
          <Link
            href="/teams"
            className="p-2 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-outer_space-500 dark:text-platinum-500">Team Name</h1>
            <p className="text-payne's_gray-500 dark:text-french_gray-500 mt-1">Manage your team members</p>
          </div>
        </div>
        {/* Add Member Button*/}
        <div className="mt-4 flex gap-x-2">
          <button
            onClick={() => {}}
            className="inline-flex items-center px-4 py-2 bg-blue_munsell-500 text-white rounded-lg hover:bg-blue_munsell-600 transition-colors"
          >
            <Users size={20} className="mr-2" />
            Invite a Member
          </button>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: "John Doe",
            role: "Project Manager",
            email: "john@example.com",
            avatar: "JD",
          },
          {
            name: "Jane Smith",
            role: "Developer",
            email: "jane@example.com",
            avatar: "JS",
          },
          {
            name: "Mike Johnson",
            role: "Designer",
            email: "mike@example.com",
            avatar: "MJ",
          },
          {
            name: "Sarah Wilson",
            role: "Developer",
            email: "sarah@example.com",
            avatar: "SW",
          },
          {
            name: "Tom Brown",
            role: "QA Engineer",
            email: "tom@example.com",
            avatar: "TB",
          },
          {
            name: "Lisa Davis",
            role: "Designer",
            email: "lisa@example.com",
            avatar: "LD",
          },
        ].map((member, index) => (
          <div
            key={index}
            className="bg-white dark:bg-outer_space-500 rounded-lg border border-french_gray-300 dark:border-payne's_gray-400 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue_munsell-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-outer_space-500 dark:text-platinum-500">{member.name}</h3>
                  <p className="text-sm text-payne's_gray-500 dark:text-french_gray-400">{member.role}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-platinum-500 dark:hover:bg-payne's_gray-400 rounded">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="flex items-center text-sm text-payne's_gray-500 dark:text-french_gray-400 mb-4">
              <Mail size={16} className="mr-2" />
              {member.email}
            </div>

            <div className="flex items-center justify-between">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Active
              </span>
              <div className="text-sm text-payne's_gray-500 dark:text-french_gray-400">
                {Math.floor(Math.random() * 10) + 1} projects
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { teamSchema, userSchema } from "@/lib/validations/validations";
import { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../../ui/button";
import { ArrowDownZA, ArrowUpAZ } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { rolesTuple } from "../../../lib/db/db-enums";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProjectMember = {
  user: z.infer<typeof userSchema>;
  teams: z.infer<typeof teamSchema>[];
  roles: (typeof rolesTuple)[number];
};

export function getProjectDataTableMemberColumns(): ColumnDef<ProjectMember>[] {
  return [
    {
      accessorKey: "user",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          User
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownZA className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={row.original.user.image_url}></AvatarImage>
            <AvatarFallback>
              <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">{row.original.user.name}</p>
            <p className="text-foreground text-xs font-light">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "teams",
      header: () => "Teams",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row.original.teams.map((team) => {
            return (
              <Badge key={`${team.id}-${row.id}`} variant="secondary" className="flex items-center p-1 px-2">
                {team.teamName}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      accessorKey: "roles",
      header: () => "Roles",
      cell: ({ row }) => (
        <Select defaultValue={row.original.roles}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select A Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
              {Object.values(rolesTuple).map((r, idx) => (
                <SelectItem key={idx} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
  ];
}

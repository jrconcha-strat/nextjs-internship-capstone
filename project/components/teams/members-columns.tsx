"use client";

import { userSchema } from "@/lib/validations/validations";
import { ColumnDef } from "@tanstack/react-table";
import z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";
import { ArrowDownZA, ArrowUpAZ } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type MemberColumn = z.infer<typeof userSchema>;

export const columns: ColumnDef<MemberColumn>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          User
          {column.getIsSorted() === "asc" ? (
            <ArrowUpAZ className="ml-2 h-4 w-4" />
          ) : (
            <ArrowDownZA className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <Avatar>
            <AvatarImage src={row.original.image_url}></AvatarImage>
            <AvatarFallback>
              <div className="h-8 w-8 rounded-full bg-white-smoke-100 ring-2 ring-white-smoke-200 animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground text-sm font-medium">{row.original.name}</p>
            <p className="text-foreground text-xs font-light">{row.original.email}</p>
          </div>
        </div>
      );
    },
  },
];

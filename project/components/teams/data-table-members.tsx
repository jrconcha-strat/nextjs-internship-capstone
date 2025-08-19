"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  RowModel,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2Icon } from "lucide-react";
import { Input } from "../ui/input";
import { UserSelect } from "@/types";

interface DataTableProps {
  isTeamLeader: boolean;
  columns: ColumnDef<UserSelect>[];
  data: UserSelect[];
  buttonAction: (selectedUsers: UserSelect[]) => void;
  buttonLoadingState: boolean;
  mode: string;
}

export function DataTable({ isTeamLeader, columns, data, buttonAction, buttonLoadingState, mode }: DataTableProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const executeButtonAction = (selectedRows: RowModel<UserSelect>) => {
    const users: UserSelect[] = selectedRows.rows.map((row) => row.original);
    buttonAction(users);
    setRowSelection({});
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search for a user..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between mt-2">
        <div className="flex items-center space-x-2">
          <p className="text-xs text-dark-grey-50">{`${pageIndex + 1} | ${table.getPageCount()}`}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.previousPage();
              setPageIndex((prev) => prev - 1);
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              table.nextPage();
              setPageIndex((prev) => prev + 1);
            }}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Show action button only if current user is TeamLeader and not in View mode */}
        {isTeamLeader && mode !== "View" && (
          <Button
            disabled={buttonLoadingState}
            onClick={() => {
              executeButtonAction(table.getSelectedRowModel());
            }}
          >
            {buttonLoadingState ? (
              <div className="flex gap-2">
                <Loader2Icon className="animate-spin " /> Loading
              </div>
            ) : (
              mode
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

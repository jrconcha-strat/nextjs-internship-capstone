// components/multi-select.tsx
"use client";

import { FC, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Option = { label: string; value: number };

type MultiSelectProps = {
  options: Option[];
  value: number[];
  onChange: (next: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
};

const MultiSelect: FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled,
  emptyText = "No results",
}) => {
  // Track open status of dropdown
  const [open, setOpen] = useState(false);

  const toggle = (val: number) => {
    // Toggle value presence in array, remove if present, add if not.
    const next = value.includes(val) ? value.filter((v) => v !== val) : [...value, val];
    onChange(next);
  };

  // Clear Button function
  const clearAll = () => onChange([]);

  const selectedOptions = options.filter((o) => value.includes(o.value));

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between bg-white", selectedOptions.length === 0 && "text-muted-foreground")}
          >
            <div className="flex flex-wrap items-center">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((opt) => (
                  <Badge key={opt.value} variant="secondary" className="flex items-center mr-1 p-1">
                    {opt.label}
                  </Badge>
                ))
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Command>
            <CommandInput placeholder="Search teams..." />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  // Check if this team is included in selected
                  const checked = value.includes(opt.value);
                  return (
                    <CommandItem key={opt.value} onSelect={() => toggle(opt.value)} className="cursor-pointer">
                      <Check className={`mr-2 h-4 w-4 ${checked ? "opacity-100" : "opacity-0"}`} />
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          {value.length > 0 && (
            <div className="flex justify-end p-2">
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelect;

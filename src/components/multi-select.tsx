'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import type { Key } from 'react';

import { cn } from '@/lib';

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui';

interface MultiSelectProps<T extends Key> {
  options: { label: string; value: T }[];
  value?: T[];
  onChange: (value: T[]) => void;
  className?: string;
}

export function MultiSelect<T extends Key>({
  options,
  value,
  onChange,
  className,
}: MultiSelectProps<T>) {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: T) => {
    const newValue = value?.includes(currentValue)
      ? value.filter((v) => v !== currentValue)
      : [...(value ?? []), currentValue];

    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          Select tracks...
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search tracks..." />
          <CommandEmpty>No tracks found.</CommandEmpty>
          <CommandGroup>
            {options.map(({ label, value: val }) => (
              <CommandItem key={val} onSelect={() => handleSelect(val)}>
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value?.includes(val) ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

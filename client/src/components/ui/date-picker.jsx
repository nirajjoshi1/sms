import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, required, disabled }) {
  const [open, setOpen] = React.useState(false);
  // Value is expected to be a string like 'YYYY-MM-DD'
  // Adding T12:00:00 prevents timezone issues causing the date to shift back one day
  const date = value ? new Date(value + "T12:00:00") : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-9 px-3 text-xs bg-muted/30 border border-border hover:bg-muted/50 focus:ring-1 focus:ring-primary/20",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
          {date ? format(date, "MMM dd, yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex flex-col" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
               const formatted = format(d, 'yyyy-MM-dd');
               // Mock an event object so existing onChange handlers don't need to be rewritten
               if (onChange) onChange({ target: { value: formatted } }); 
            } else {
               if (onChange) onChange({ target: { value: '' } });
            }
            setOpen(false);
          }}
          initialFocus
        />
        <div className="w-full border-t border-border p-1.5 bg-muted/10 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            className="w-full h-7 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary"
            onClick={() => {
              const today = new Date();
              const formatted = format(today, 'yyyy-MM-dd');
              if (onChange) onChange({ target: { value: formatted } });
              setOpen(false);
            }}
          >
            Select Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

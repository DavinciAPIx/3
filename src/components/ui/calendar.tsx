
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-transparent pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-6 sm:space-x-6 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-6",
        caption_label: "text-xl font-bold text-foreground tracking-tight",
        nav: "space-x-2 flex items-center",
        nav_button: cn(
          "h-10 w-10 bg-muted/50 border-0 hover:bg-muted transition-all duration-200 rounded-xl hover:scale-105 active:scale-95 pointer-events-auto"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-2",
        head_row: "flex mb-4",
        head_cell:
          "text-muted-foreground/70 rounded-xl w-11 h-11 font-semibold text-sm flex items-center justify-center uppercase tracking-wider",
        row: "flex w-full mt-2",
        cell: "h-11 w-11 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 pointer-events-auto",
        day: cn(
          "h-11 w-11 p-0 font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer",
          "hover:bg-muted/70 focus:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-foreground text-background hover:bg-foreground/90 focus:bg-foreground/90 font-bold shadow-lg scale-105 pointer-events-auto",
        day_today: "bg-muted/70 text-foreground font-bold ring-2 ring-foreground/20 ring-offset-2 ring-offset-background",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-40 pointer-events-auto",
        day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed pointer-events-none",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

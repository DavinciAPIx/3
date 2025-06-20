
import * as React from "react"
import { format, setYear, setMonth } from "date-fns"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  disabled?: boolean
}

export function DatePicker({ 
  date, 
  onSelect, 
  placeholder = "Pick a date",
  minDate,
  disabled = false
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date || new Date())
  const [open, setOpen] = React.useState(false)
  
  const currentYear = currentMonth.getFullYear()
  const currentMonthIndex = currentMonth.getMonth()
  
  // Generate year options (from 1900 to current year + 10)
  const yearOptions = React.useMemo(() => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let year = 1900; year <= currentYear + 10; year++) {
      years.push(year)
    }
    return years.reverse() // Most recent years first
  }, [])
  
  const monthOptions = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const handleYearChange = (yearString: string) => {
    const year = parseInt(yearString)
    const newDate = setYear(currentMonth, year)
    setCurrentMonth(newDate)
  }
  
  const handleMonthChange = (monthString: string) => {
    const monthIndex = monthOptions.indexOf(monthString)
    const newDate = setMonth(currentMonth, monthIndex)
    setCurrentMonth(newDate)
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate)
    if (selectedDate) {
      setOpen(false) // Close the popover when a date is selected
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-14 px-4 rounded-2xl border-0 bg-muted/50 hover:bg-muted transition-all duration-300 focus:ring-0 focus:bg-muted shadow-sm hover:shadow-md",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="h-5 w-5 mr-3 text-foreground/70" />
          {date ? (
            <span className="text-base font-medium text-foreground">
              {format(date, "MMM d, yyyy")}
            </span>
          ) : (
            <span className="text-base font-medium text-muted-foreground">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border-0 shadow-2xl rounded-3xl overflow-hidden" align="start">
        <div className="bg-gradient-to-br from-background to-muted/20">
          {/* Year and Month Selection Header */}
          <div className="flex items-center justify-center gap-2 p-4 border-b border-muted/30">
            <Select value={monthOptions[currentMonthIndex]} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-auto h-10 text-sm font-medium border-0 bg-muted/50 hover:bg-muted focus:ring-0">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month} className="text-sm">
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={currentYear.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-auto h-10 text-sm font-medium border-0 bg-muted/50 hover:bg-muted focus:ring-0">
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-2" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-sm">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Calendar */}
          <div className="p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              disabled={minDate ? (date) => date < minDate : undefined}
              initialFocus
              className="pointer-events-auto"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

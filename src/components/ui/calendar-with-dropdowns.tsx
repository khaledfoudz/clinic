import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DropdownProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CalendarWithDropdowns({
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarProps & { onMonthChange?: (month: Date) => void }) {
  const [internalMonth, setInternalMonth] = React.useState<Date>(controlledMonth || new Date());
  
  const currentMonth = controlledMonth || internalMonth;
  
  const handleMonthChange = (newMonth: Date) => {
    setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  return (
    <DayPicker
      month={currentMonth}
      onMonthChange={handleMonthChange}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "hidden",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Dropdown: ({ value, onChange, children, ...dropdownProps }: DropdownProps) => {
          const options = children && React.Children.toArray(children) as React.ReactElement[];
          const selected = options?.find((child) => child.props.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select
              value={value?.toString()}
              onValueChange={(value) => {
                handleChange(value);
              }}
            >
              <SelectTrigger className="h-8 w-auto px-2 py-0 text-sm font-medium focus:ring-0 focus:ring-offset-0 border-0 shadow-none bg-transparent hover:bg-accent/50 data-[state=open]:bg-accent/50 [&>svg]:ml-1 [&>svg]:h-4 [&>svg]:w-4">
                <SelectValue>{selected?.props?.children}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem
                    key={option.props.value?.toString() ?? ""}
                    value={option.props.value?.toString() ?? ""}
                  >
                    {option.props.children}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        Caption: ({ displayMonth }) => {
          const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          
          const currentYear = displayMonth.getFullYear();
          const years = Array.from({ length: 41 }, (_, i) => currentYear - 20 + i);
          
          return (
            <div className="flex justify-center items-center gap-2">
              <Select
                value={displayMonth.getMonth().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(displayMonth);
                  newDate.setMonth(parseInt(value));
                  handleMonthChange(newDate);
                }}
              >
                <SelectTrigger className="h-8 w-auto min-w-[100px] px-2 py-0 text-sm font-medium border-0 shadow-none bg-transparent hover:bg-accent/50 focus:ring-0 focus:ring-offset-0">
                  <SelectValue>{months[displayMonth.getMonth()]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={displayMonth.getFullYear().toString()}
                onValueChange={(value) => {
                  const newDate = new Date(displayMonth);
                  newDate.setFullYear(parseInt(value));
                  handleMonthChange(newDate);
                }}
              >
                <SelectTrigger className="h-8 w-auto min-w-[80px] px-2 py-0 text-sm font-medium border-0 shadow-none bg-transparent hover:bg-accent/50 focus:ring-0 focus:ring-offset-0">
                  <SelectValue>{displayMonth.getFullYear()}</SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      }}
      {...props}
    />
  );
}
CalendarWithDropdowns.displayName = "CalendarWithDropdowns";

export { CalendarWithDropdowns };
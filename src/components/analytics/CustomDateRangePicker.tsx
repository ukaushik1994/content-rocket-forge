
import React, { useState } from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

interface CustomDateRangePickerProps {
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
}

export const CustomDateRangePicker: React.FC<CustomDateRangePickerProps> = ({
  onDateRangeChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    onDateRangeChange(newDateRange);
    if (newDateRange?.from && newDateRange?.to) {
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange?.from) return "Select custom range";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`justify-start text-left font-normal bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50 ${className}`}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
        />
      </PopoverContent>
    </Popover>
  );
};

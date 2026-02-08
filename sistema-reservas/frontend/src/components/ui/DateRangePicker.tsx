'use client';

import * as React from 'react';
import { format, isAfter, isBefore, isSameDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  onRangeSelect: (range: { from: string; to: string }) => void;
  initialRange?: { from: string; to: string };
}

export function DateRangePicker({ onRangeSelect, initialRange }: DateRangePickerProps) {
  const [range, setRange] = React.useState<DateRange | undefined>(() => {
    if (initialRange?.from && initialRange?.to) {
      return {
        from: new Date(initialRange.from),
        to: new Date(initialRange.to)
      };
    }
    return undefined;
  });
  
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (newRange: DateRange | undefined) => {
    setRange(newRange);
    if (newRange?.from && newRange?.to) {
      onRangeSelect({
        from: format(newRange.from, 'yyyy-MM-dd'),
        to: format(newRange.to, 'yyyy-MM-dd')
      });
      setIsOpen(false);
    }
  };

  const clearRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRange(undefined);
    onRangeSelect({ from: '', to: '' });
  };

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 transition-all text-sm"
      >
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
          <CalendarIcon size={18} className="text-stone-400" />
          {range?.from ? (
            <span className="font-medium text-stone-800 dark:text-stone-100">
              {format(range.from, 'dd/MM/yyyy')} {range.to ? ` - ${format(range.to, 'dd/MM/yyyy')}` : '...'}
            </span>
          ) : (
            <span className="text-stone-400 dark:text-stone-500">Selecione o período (Check-in / Check-out)</span>
          )}
        </div>
        {range?.from && (
          <button onClick={clearRange} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-full text-stone-400">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <style>{`
              .rdp { --rdp-accent-color: #166534; --rdp-background-color: #f0fdf4; margin: 0; }
              .dark .rdp { --rdp-background-color: #064e3b; color: #ecfdf5; }
              .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { background-color: var(--rdp-accent-color); color: white; }
              .rdp-day_range_middle { background-color: var(--rdp-background-color) !important; color: #166534 !important; }
              .dark .rdp-day_range_middle { color: #d1fae5 !important; }
              .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #1f2937; }
            `}</style>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={handleSelect}
              locale={ptBR}
              numberOfMonths={2}
              disabled={{ before: new Date() }}
              className="border-none"
            />
          </div>
        </>
      )}
    </div>
  );
}

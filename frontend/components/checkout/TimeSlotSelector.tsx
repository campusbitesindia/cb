'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_SLOT_CONFIG,
  SlotConfig,
  generateTimeSlots,
  getLeadBufferMinutes,
  isPeakHour,
} from '@/lib/timeSlotUtils';
import { Calendar, Clock, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotSelectorProps {
  selectedValue: string;
  onChange: (value: string) => void;
  openingHour?: number;
  closingHour?: number;
  /** Optional overrides for buffers, peak windows and closing cutoff */
  config?: Partial<SlotConfig>;
}

export default function TimeSlotSelector({
  selectedValue,
  onChange,
  openingHour = DEFAULT_SLOT_CONFIG.openingHour,
  closingHour = DEFAULT_SLOT_CONFIG.closingHour,
  config,
}: TimeSlotSelectorProps) {
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow'>('today');
  // Bumped every minute so slots that drift inside the lead buffer while the
  // page stays open disappear without a reload.
  const [clockTick, setClockTick] = useState(0);

  // Keep the latest onChange without making it an effect dependency (cart
  // passes an inline arrow that changes identity every render).
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const slotConfig = useMemo<Partial<SlotConfig>>(
    () => ({ ...config, openingHour, closingHour }),
    [config, openingHour, closingHour]
  );

  useEffect(() => {
    const interval = setInterval(() => setClockTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => new Date(), [clockTick]);
  const tomorrowDate = useMemo(() => {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d;
  }, [now]);

  const todaySlots = useMemo(
    () => generateTimeSlots(now, slotConfig),
    [now, slotConfig]
  );
  const tomorrowSlots = useMemo(
    () => generateTimeSlots(tomorrowDate, slotConfig),
    [tomorrowDate, slotConfig]
  );

  const activeSlots = selectedDay === 'today' ? todaySlots : tomorrowSlots;

  // If today has no remaining capacity (past last orderable slot), switch to tomorrow
  useEffect(() => {
    if (selectedDay === 'today' && todaySlots.length === 0) {
      setSelectedDay('tomorrow');
    }
  }, [selectedDay, todaySlots]);

  // Stale-state cleanup: any selection the active day no longer offers
  // (tab switch, buffer drift, config change) is reset immediately.
  useEffect(() => {
    if (selectedValue && !activeSlots.some((s) => s.value === selectedValue)) {
      onChangeRef.current('');
    }
  }, [selectedValue, activeSlots]);

  // Absolute isolation between day tabs: switching always clears the
  // partially selected slot synchronously, before the new grid renders.
  const handleDaySelect = (day: 'today' | 'tomorrow') => {
    if (day === selectedDay) return;
    if (selectedValue) onChangeRef.current('');
    setSelectedDay(day);
  };

  const peakActive = isPeakHour(now, slotConfig.peakWindows ?? DEFAULT_SLOT_CONFIG.peakWindows);
  const currentBuffer = getLeadBufferMinutes(now, slotConfig);

  return (
    <div className="space-y-4">
      {/* Day Selector Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => handleDaySelect('today')}
          disabled={todaySlots.length === 0}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200",
            selectedDay === 'today'
              ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Today</span>
        </button>
        <button
          type="button"
          onClick={() => handleDaySelect('tomorrow')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-lg transition-all duration-200",
            selectedDay === 'tomorrow'
              ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>Tomorrow</span>
        </button>
      </div>

      {/* Rolling lead-time notice (only meaningful for same-day pickups) */}
      {selectedDay === 'today' && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {peakActive ? (
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          ) : (
            <Clock className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>
            {peakActive
              ? `Peak hours — earliest pickup is ${currentBuffer} min from now.`
              : `Earliest pickup is ${currentBuffer} min from now.`}
          </span>
        </div>
      )}

      {/* Slots Display */}
      {activeSlots.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
          {activeSlots.map((slot) => {
            const isSelected = selectedValue === slot.value;
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => onChange(slot.value)}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 text-xs sm:text-sm font-medium border rounded-xl transition-all duration-200 hover:scale-105",
                  isSelected
                    ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-500/10"
                    : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <Clock className={cn("w-3.5 h-3.5 mb-1", isSelected ? "text-white" : "text-slate-400 dark:text-slate-500")} />
                {slot.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
          <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No delivery slots available</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please try again tomorrow or during opening hours.</p>
        </div>
      )}
    </div>
  );
}

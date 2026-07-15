export interface TimeSlot {
  label: string; // e.g. "09:00 AM", "09:15 AM"
  value: string; // ISO String (or format like "YYYY-MM-DDTHH:mm")
  date: Date;
}

/** A rush window during which the pickup lead buffer is extended. Hours are 0-23; start inclusive, end exclusive. */
export interface PeakWindow {
  startHour: number;
  endHour: number;
}

export interface SlotConfig {
  /** Vendor opening hour (default: 9) */
  openingHour: number;
  /** Vendor closing hour (default: 22) */
  closingHour: number;
  /** Standard lead buffer in minutes (default: 15) */
  baseBufferMinutes: number;
  /** Extended lead buffer applied during peak windows (default: 25) */
  peakBufferMinutes: number;
  /** Rush periods with heavier order volume (default: lunch 12-14, dinner 19-21) */
  peakWindows: PeakWindow[];
  /** No slot is offered within this many minutes of closing (default: 30) */
  closingCutoffMinutes: number;
  /** Slot granularity in minutes (default: 15) */
  slotIntervalMinutes: number;
}

export const DEFAULT_SLOT_CONFIG: SlotConfig = {
  openingHour: 9,
  closingHour: 22,
  baseBufferMinutes: 15,
  peakBufferMinutes: 25,
  peakWindows: [
    { startHour: 12, endHour: 14 },
    { startHour: 19, endHour: 21 },
  ],
  closingCutoffMinutes: 30,
  slotIntervalMinutes: 15,
};

/** True if the given moment falls inside any configured rush window. */
export function isPeakHour(
  date: Date,
  peakWindows: PeakWindow[] = DEFAULT_SLOT_CONFIG.peakWindows
): boolean {
  const hour = date.getHours() + date.getMinutes() / 60;
  return peakWindows.some((w) => hour >= w.startHour && hour < w.endHour);
}

/**
 * Rolling lead buffer: the standard buffer, extended while the kitchen is in
 * a peak window. Volume-driven callers can feed their own peakWindows/buffers
 * through `config` (e.g. derived from live order counts).
 */
export function getLeadBufferMinutes(
  now: Date = new Date(),
  config: Partial<SlotConfig> = {}
): number {
  const cfg = { ...DEFAULT_SLOT_CONFIG, ...config };
  return isPeakHour(now, cfg.peakWindows)
    ? cfg.peakBufferMinutes
    : cfg.baseBufferMinutes;
}

function formatSlotLabel(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

/**
 * Generates selectable pickup slots for a day, constrained to the vendor's
 * operational window: never past closing, never within the closing cutoff,
 * and (for today) never inside the rolling lead buffer.
 */
export function generateTimeSlots(
  date: Date = new Date(),
  config: Partial<SlotConfig> = {}
): TimeSlot[] {
  const cfg = { ...DEFAULT_SLOT_CONFIG, ...config };
  if (cfg.closingHour <= cfg.openingHour || cfg.slotIntervalMinutes <= 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  const start = new Date(date);
  start.setHours(cfg.openingHour, 0, 0, 0);

  const closing = new Date(date);
  closing.setHours(cfg.closingHour, 0, 0, 0);
  // Last orderable moment: the kitchen stops accepting pickups this many
  // minutes before it shuts down.
  const end = new Date(closing.getTime() - cfg.closingCutoffMinutes * 60 * 1000);

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const bufferThreshold = new Date(
    now.getTime() + getLeadBufferMinutes(now, cfg) * 60 * 1000
  );

  const current = new Date(start);
  while (current <= end) {
    // Only apply the lead buffer when generating slots for TODAY
    const isFutureSlot = !isToday || current > bufferThreshold;

    if (isFutureSlot) {
      slots.push({
        label: formatSlotLabel(current),
        value: current.toISOString(),
        date: new Date(current),
      });
    }
    current.setMinutes(current.getMinutes() + cfg.slotIntervalMinutes);
  }

  return slots;
}

/**
 * Submit-time validation hook. Re-checks a previously selected slot against
 * the vendor's operational window and the CURRENT rolling buffer, so a slot
 * that was valid when rendered but has since drifted stale is rejected.
 */
export function validateTimeSlot(
  value: string,
  config: Partial<SlotConfig> = {},
  now: Date = new Date()
): { valid: boolean; reason?: string } {
  const cfg = { ...DEFAULT_SLOT_CONFIG, ...config };

  const slot = new Date(value);
  if (isNaN(slot.getTime())) {
    return { valid: false, reason: 'Please select a valid pickup time' };
  }

  const buffer = getLeadBufferMinutes(now, cfg);
  if (slot.getTime() - now.getTime() < buffer * 60 * 1000) {
    const peakNote = isPeakHour(now, cfg.peakWindows) ? ' (peak hours)' : '';
    return {
      valid: false,
      reason: `Pickup time must be at least ${buffer} minutes from now${peakNote}`,
    };
  }

  const opening = new Date(slot);
  opening.setHours(cfg.openingHour, 0, 0, 0);
  if (slot < opening) {
    return { valid: false, reason: 'Pickup time is before the canteen opens' };
  }

  const closing = new Date(slot);
  closing.setHours(cfg.closingHour, 0, 0, 0);
  const lastOrderable = new Date(
    closing.getTime() - cfg.closingCutoffMinutes * 60 * 1000
  );
  if (slot > lastOrderable) {
    return {
      valid: false,
      reason: `Pickup must be at least ${cfg.closingCutoffMinutes} minutes before closing`,
    };
  }

  return { valid: true };
}

/**
 * Formats a Date object to a readable string for tab titles (e.g., "Today", "Tomorrow", "Fri, Jul 10")
 */
export function formatSlotDay(date: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

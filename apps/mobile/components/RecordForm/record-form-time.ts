/** Time helpers for RecordForm start/end/duration fields */

export function timeToMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function minutesToTime(minutes: number): Date {
  const date = new Date();
  date.setHours(Math.floor(minutes / 60));
  date.setMinutes(minutes % 60);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

export function parseTimeFromDB(timeStr: string): Date | null {
  if (!timeStr || timeStr === "00:00:00") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

export function calculateDurationMinutes(startTime: Date, endTime: Date): number {
  let diff = endTime.getTime() - startTime.getTime();
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return Math.round(diff / (1000 * 60));
}

export function formatTimeForDB(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTimeDisplay(date: Date | null): string {
  if (!date) return "--:--";
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Rounds to the current minute (drops seconds) for picker defaults */
export function nowAsTime(): Date {
  const d = new Date();
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

export function seedTimeForPicker(
  type: "start" | "end",
  startTime: Date | null,
  endTime: Date | null,
  duration: Date
): Date {
  if (type === "start") {
    if (startTime) return startTime;
    if (endTime) {
      const durMin = timeToMinutes(duration);
      let startMin = timeToMinutes(endTime) - durMin;
      if (startMin < 0) startMin += 24 * 60;
      return minutesToTime(startMin);
    }
    return nowAsTime();
  }

  if (endTime) return endTime;
  if (startTime) {
    const durMin = timeToMinutes(duration);
    let endMin = timeToMinutes(startTime) + durMin;
    if (endMin >= 24 * 60) endMin -= 24 * 60;
    return minutesToTime(endMin);
  }
  return nowAsTime();
}

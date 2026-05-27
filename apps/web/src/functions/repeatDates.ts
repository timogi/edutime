import {
  addDays,
  addYears,
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  max as maxDate,
  min as minDate,
  startOfDay,
} from 'date-fns'

/** Maximum calendar span (start → end) when building repeat intervals. */
export const MAX_REPEAT_CALENDAR_DAYS = 366

/** Maximum number of entries created from a single repeat action. */
export const MAX_REPEAT_ENTRY_COUNT = 500

/** Sample compare above this length (avoids JSON.stringify on huge arrays). */
const DATES_EQUAL_FULL_COMPARE_LIMIT = 50

export function getRepeatMaxEndDate(start: Date): Date {
  return addYears(start, 1)
}

export function clampRepeatEndDate(start: Date, end: Date): Date {
  const maxEnd = getRepeatMaxEndDate(start)
  const cappedByYear = minDate([end, maxEnd])
  const maxSpanEnd = addDays(start, MAX_REPEAT_CALENDAR_DAYS - 1)
  return maxDate([start, minDate([cappedByYear, maxSpanEnd])])
}

/**
 * Nächste Näherung für Unterricht-Ende im Kanton Bern (Volksschule, deutschsprachig):
 * üblich bis kurz vor den Winterferien (~23.12.) bzw. bis Sommerferien (~Anfang Juli).
 * Orientierung an BK-D-Ferienplänung; konkrete Daten variieren nach Jahr/Gemeinde — diese
 * Daten sind nur eine stabile UX-Näherung (nicht die amtliche Ferienmatrix).
 *
 * Siehe z. B.: https://www.akvb-gemeinden.bkd.be.ch (Schulferienplanung BE).
 */
const BERN_SEMESTER1_END_MONTH = 11 // December (0-based)
const BERN_SEMESTER1_END_DAY = 23
const BERN_SEMESTER2_END_MONTH = 6 // July
const BERN_SEMESTER2_END_DAY = 5

export function getDefaultBernSemesterApproxEnd(start: Date): Date {
  const startDay = startOfDay(start)
  const y = start.getFullYear()
  const candidates: Date[] = []
  for (const yearOffset of [0, 1] as const) {
    const yy = y + yearOffset
    candidates.push(
      startOfDay(new Date(yy, BERN_SEMESTER1_END_MONTH, BERN_SEMESTER1_END_DAY)),
      startOfDay(new Date(yy, BERN_SEMESTER2_END_MONTH, BERN_SEMESTER2_END_DAY)),
    )
  }
  const future = candidates
    .filter((d) => !isBefore(d, startDay))
    .sort((a, b) => a.getTime() - b.getTime())
  if (future.length > 0) {
    return future[0]
  }
  return clampRepeatEndDate(start, addDays(startDay, 30))
}

export function isRepeatIntervalTooLarge(start: Date, end: Date): boolean {
  return isAfter(end, clampRepeatEndDate(start, end))
}

type BuildRepeatDatesResult = {
  dates: Date[]
  truncated: boolean
  intervalTooLarge: boolean
}

export function buildRepeatDates(
  start: Date,
  end: Date,
  selectedWeekdays: string[],
): BuildRepeatDatesResult {
  const clampedEnd = clampRepeatEndDate(start, end)
  const intervalTooLarge = isRepeatIntervalTooLarge(start, end)

  let dates = eachDayOfInterval({ start, end: clampedEnd }).filter((d) =>
    selectedWeekdays.includes(format(d, 'eeee')),
  )

  let truncated = false
  if (dates.length > MAX_REPEAT_ENTRY_COUNT) {
    dates = dates.slice(0, MAX_REPEAT_ENTRY_COUNT)
    truncated = true
  }

  return {
    dates,
    truncated,
    intervalTooLarge: intervalTooLarge || truncated,
  }
}

export function capRepeatDatesPicker(dates: Date[]): {
  dates: Date[]
  truncated: boolean
} {
  if (dates.length <= MAX_REPEAT_ENTRY_COUNT) {
    return { dates, truncated: false }
  }
  return {
    dates: dates.slice(0, MAX_REPEAT_ENTRY_COUNT),
    truncated: true,
  }
}

export function areRepeatDatesEqual(a: Date[], b: Date[]): boolean {
  if (a.length !== b.length) return false
  if (a.length === 0) return true

  if (a.length <= DATES_EQUAL_FULL_COMPARE_LIMIT) {
    return a.every((d, i) => d.getTime() === b[i].getTime())
  }

  const sampleIndices = [0, Math.floor(a.length / 2), a.length - 1]
  return sampleIndices.every((i) => a[i].getTime() === b[i].getTime())
}

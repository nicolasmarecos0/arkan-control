import { z } from 'zod'
import type { Brand } from '../shared/brand'
import { ValidationError } from '../shared/errors'

/**
 * Time policy for ARKAN Control.
 *
 * 1. Every instant is stored in UTC (`timestamptz`) and handled as a `Date`.
 * 2. Every calendar date the business declares (fecha del hecho as a day, initial
 *    balance date, future period boundaries) is stored as a plain `YYYY-MM-DD`
 *    string, never as an instant, so it cannot drift with a timezone conversion.
 * 3. The business calendar is Paraguay. Turning an instant into a business day is
 *    an explicit call to `toBusinessDate`; nothing derives a day from the server's
 *    local timezone.
 */
export const BUSINESS_TIMEZONE = 'America/Asuncion'

/** A calendar day in the business timezone, as `YYYY-MM-DD`. */
export type CalendarDate = Brand<string, 'CalendarDate'>

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function calendarDate(value: string): CalendarDate {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    throw new ValidationError('A calendar date must use the YYYY-MM-DD format', { value })
  }
  const [year, month, day] = value.split('-').map(Number) as [number, number, number]
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  if (
    asUtc.getUTCFullYear() !== year ||
    asUtc.getUTCMonth() !== month - 1 ||
    asUtc.getUTCDate() !== day
  ) {
    throw new ValidationError('A calendar date must exist in the calendar', { value })
  }
  return value as CalendarDate
}

export const calendarDateSchema = z.string().transform(calendarDate)

const businessDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** The business day an instant falls on, in the business timezone. */
export function toBusinessDate(instant: Date): CalendarDate {
  if (Number.isNaN(instant.getTime())) {
    throw new ValidationError('Cannot derive a business date from an invalid instant')
  }
  return calendarDate(businessDateFormatter.format(instant))
}

export function instant(value: Date | string | number): Date {
  const parsed = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError('Invalid instant', { value: String(value) })
  }
  return parsed
}

export const instantSchema = z.union([z.date(), z.string(), z.number()]).transform(instant)

/**
 * The two timestamps every operative record carries.
 *
 * `occurredAt` is when the fact happened in the real world — it is what metrics
 * read. `recordedAt` is when ARKAN learned about it. They are independent fields
 * and must never be collapsed into one.
 */
export interface TemporalStamp {
  readonly occurredAt: Date
  readonly recordedAt: Date
}

/** True when the fact was captured after it happened (deferred capture). */
export function isBackdated(stamp: TemporalStamp): boolean {
  return stamp.occurredAt.getTime() < stamp.recordedAt.getTime()
}

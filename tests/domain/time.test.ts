import { describe, expect, it } from 'vitest'
import {
  BUSINESS_TIMEZONE,
  calendarDate,
  isBackdated,
  toBusinessDate,
  type TemporalStamp,
} from '@/domain/time/time'
import { ValidationError } from '@/domain/shared/errors'

describe('fecha del hecho vs fecha de registro', () => {
  it('keeps both timestamps as independent fields', () => {
    const stamp: TemporalStamp = {
      occurredAt: new Date('2026-08-10T12:00:00.000Z'),
      recordedAt: new Date('2026-08-20T09:15:00.000Z'),
    }
    expect(stamp.occurredAt.getTime()).not.toBe(stamp.recordedAt.getTime())
    expect(isBackdated(stamp)).toBe(true)
  })

  it('does not consider a fact backdated when both instants match', () => {
    const now = new Date('2026-08-20T09:15:00.000Z')
    expect(isBackdated({ occurredAt: now, recordedAt: now })).toBe(false)
  })
})

describe('calendar dates', () => {
  it('accepts a well formed day', () => {
    expect(calendarDate('2026-08-01')).toBe('2026-08-01')
  })

  it('rejects malformed and impossible days', () => {
    expect(() => calendarDate('2026-8-1')).toThrow(ValidationError)
    expect(() => calendarDate('2026-02-30')).toThrow(ValidationError)
    expect(() => calendarDate('not a date')).toThrow(ValidationError)
  })

  it('derives the business day in the Paraguayan calendar, not the server one', () => {
    expect(BUSINESS_TIMEZONE).toBe('America/Asuncion')
    // 02:30 UTC is still the previous day in Asunción (UTC-3 / UTC-4).
    expect(toBusinessDate(new Date('2026-08-21T02:30:00.000Z'))).toBe('2026-08-20')
    expect(toBusinessDate(new Date('2026-08-20T14:30:00.000Z'))).toBe('2026-08-20')
  })
})

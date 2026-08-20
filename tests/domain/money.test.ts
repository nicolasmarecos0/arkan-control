import { describe, expect, it } from 'vitest'
import {
  addPyg,
  formatPyg,
  guarani,
  guaraniSchema,
  multiplyPyg,
  subtractPyg,
  ZERO_PYG,
} from '@/domain/money/guarani'
import { ValidationError } from '@/domain/shared/errors'

describe('PYG amounts', () => {
  it('accepts whole guaraní amounts', () => {
    expect(guarani(0)).toBe(0)
    expect(guarani(1_500_000)).toBe(1_500_000)
    expect(guarani(-250_000)).toBe(-250_000)
  })

  it('rejects fractional amounts', () => {
    expect(() => guarani(1500.5)).toThrow(ValidationError)
    expect(() => guarani(0.1)).toThrow(ValidationError)
    expect(() => guarani(-1.25)).toThrow(ValidationError)
  })

  it('rejects non-finite and unsafe amounts', () => {
    expect(() => guarani(Number.NaN)).toThrow(ValidationError)
    expect(() => guarani(Number.POSITIVE_INFINITY)).toThrow(ValidationError)
    expect(() => guarani(Number.MAX_SAFE_INTEGER + 2)).toThrow(ValidationError)
  })

  it('rejects fractional amounts through the validation schema too', () => {
    expect(guaraniSchema.safeParse(1_000).success).toBe(true)
    expect(guaraniSchema.safeParse(1_000.75).success).toBe(false)
    expect(guaraniSchema.safeParse('1000').success).toBe(false)
  })

  it('keeps arithmetic in the integer domain', () => {
    expect(addPyg(guarani(1_000), guarani(2_500))).toBe(3_500)
    expect(subtractPyg(guarani(1_000), guarani(2_500))).toBe(-1_500)
    expect(multiplyPyg(guarani(12_500), 4)).toBe(50_000)
    expect(() => multiplyPyg(guarani(12_500), 1.5)).toThrow(ValidationError)
  })

  it('formats amounts the Paraguayan way', () => {
    expect(formatPyg(ZERO_PYG)).toBe('Gs. 0')
    expect(formatPyg(guarani(1_500_000))).toBe('Gs. 1.500.000')
    expect(formatPyg(guarani(-45_000))).toBe('-Gs. 45.000')
  })
})

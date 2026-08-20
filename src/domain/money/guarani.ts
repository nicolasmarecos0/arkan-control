import { z } from 'zod'
import type { Brand } from '../shared/brand'
import { ValidationError } from '../shared/errors'

/**
 * PYG amount.
 *
 * P2-A is single currency (guaraníes). The guaraní has no minor unit in practice,
 * so a documental amount is always a whole number of guaraníes. Money never uses
 * floating point arithmetic here: values are integers and every operation stays in
 * the integer domain.
 */
export type Guarani = Brand<number, 'Guarani'>

/** Largest amount we accept; keeps every sum inside the safe-integer range. */
export const MAX_GUARANI = Number.MAX_SAFE_INTEGER

export function isValidGuaraniAmount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value)
}

/** Builds a PYG amount. Rejects fractional, non-finite and unsafe values. */
export function guarani(value: number): Guarani {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError('A PYG amount must be a finite number', { value })
  }
  if (!Number.isInteger(value)) {
    throw new ValidationError('A PYG amount must be a whole number of guaraníes', { value })
  }
  if (!Number.isSafeInteger(value)) {
    throw new ValidationError('A PYG amount is out of the representable range', { value })
  }
  return value as Guarani
}

export const ZERO_PYG = guarani(0)

export function addPyg(a: Guarani, b: Guarani): Guarani {
  return guarani(a + b)
}

export function subtractPyg(a: Guarani, b: Guarani): Guarani {
  return guarani(a - b)
}

/** Multiplies an amount by a whole quantity (unit price times units, for example). */
export function multiplyPyg(amount: Guarani, quantity: number): Guarani {
  if (!Number.isInteger(quantity)) {
    throw new ValidationError('A PYG amount can only be multiplied by a whole quantity', {
      quantity,
    })
  }
  return guarani(amount * quantity)
}

export function isNegativePyg(amount: Guarani): boolean {
  return amount < 0
}

export function assertNonNegativePyg(amount: Guarani, context: string): Guarani {
  if (amount < 0) {
    throw new ValidationError(`${context} cannot be negative`, { amount })
  }
  return amount
}

/** Presentation helper. Paraguayan format: thousands separated by a dot. */
export function formatPyg(amount: Guarani): string {
  const sign = amount < 0 ? '-' : ''
  const digits = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}Gs. ${digits}`
}

/** Zod schema for any external input that carries a PYG amount. */
export const guaraniSchema = z
  .number({ error: 'A PYG amount must be a number' })
  .refine(Number.isInteger, { error: 'A PYG amount must be a whole number of guaraníes' })
  .refine(Number.isSafeInteger, { error: 'A PYG amount is out of the representable range' })
  .transform((value) => value as Guarani)

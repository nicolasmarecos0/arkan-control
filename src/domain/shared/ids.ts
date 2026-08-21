import { z } from 'zod'
import type { Brand } from './brand'
import { ValidationError } from './errors'

const uuidSchema = z.uuid()

function parseId<T extends string>(value: string, kind: string): Brand<string, T> {
  const parsed = uuidSchema.safeParse(value)
  if (!parsed.success) {
    throw new ValidationError(`${kind} must be a UUID`, { kind, value })
  }
  return parsed.data as Brand<string, T>
}

export type BusinessId = Brand<string, 'BusinessId'>
export type UserId = Brand<string, 'UserId'>
export type AccessGrantId = Brand<string, 'AccessGrantId'>
export type FactId = Brand<string, 'FactId'>
export type OperationId = Brand<string, 'OperationId'>

export const businessId = (value: string): BusinessId => parseId<'BusinessId'>(value, 'BusinessId')
export const userId = (value: string): UserId => parseId<'UserId'>(value, 'UserId')
export const accessGrantId = (value: string): AccessGrantId =>
  parseId<'AccessGrantId'>(value, 'AccessGrantId')
export const factId = (value: string): FactId => parseId<'FactId'>(value, 'FactId')
export const operationId = (value: string): OperationId =>
  parseId<'OperationId'>(value, 'OperationId')

export const businessIdSchema = z.string().transform(businessId)
export const userIdSchema = z.string().transform(userId)

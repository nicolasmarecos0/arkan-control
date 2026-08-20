import { z } from 'zod'

/**
 * The catalogue of facts ARKAN Control can record today.
 *
 * Slice 1 only produces foundation facts. Commercial facts (venta registrada,
 * stock actualizado, cobro registrado, compra ingresada, devolución, gasto,
 * aporte...) are added to this registry by the slice that implements them — the
 * ledger itself does not change.
 */
export const FACT_TYPES = {
  NEGOCIO_CREADO: 'NEGOCIO_CREADO',
  ACCESO_OTORGADO: 'ACCESO_OTORGADO',
  ACCESO_REVOCADO: 'ACCESO_REVOCADO',
} as const

export type FactType = (typeof FACT_TYPES)[keyof typeof FACT_TYPES]

export const FACT_TYPE_VALUES = Object.values(FACT_TYPES) as [FactType, ...FactType[]]

export const factTypeSchema = z.enum(FACT_TYPE_VALUES)

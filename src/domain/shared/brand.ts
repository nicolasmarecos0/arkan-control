/**
 * Nominal typing helper. A branded type cannot be produced by accident: it has to
 * pass through the constructor that validates its invariants.
 */
declare const __brand: unique symbol

export type Brand<T, B extends string> = T & { readonly [__brand]: B }

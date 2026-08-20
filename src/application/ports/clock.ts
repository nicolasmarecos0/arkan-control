/** Time comes from a port so use cases stay deterministic under test. */
export interface Clock {
  now(): Date
}

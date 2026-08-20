/** Base class for every error raised by the domain layer. */
export class DomainError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = new.target.name
  }
}

/** The input does not satisfy the shape or the value rules of the domain. */
export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details)
  }
}

/** A rule that must hold at all times would be broken by the attempted change. */
export class InvariantViolationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVARIANT_VIOLATION', details)
  }
}

/** An operation tried to mix data belonging to two different businesses. */
export class TenantIsolationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TENANT_ISOLATION', details)
  }
}

/** The requested entity does not exist inside the current business scope. */
export class NotFoundError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', details)
  }
}

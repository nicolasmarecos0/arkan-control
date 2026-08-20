import type { Clock } from '@/application/ports/clock'

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}

/** Test double: time only moves when a test moves it. */
export class FixedClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return new Date(this.current.getTime())
  }

  set(next: Date): void {
    this.current = next
  }

  advance(milliseconds: number): void {
    this.current = new Date(this.current.getTime() + milliseconds)
  }
}

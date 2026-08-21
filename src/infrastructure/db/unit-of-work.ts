import { and, eq, isNull, sql } from 'drizzle-orm'
import type { IdGenerator } from '@/application/ports/id-generator'
import type {
  OperationCommand,
  OperationOutcome,
  TransactionContext,
  UnitOfWork,
} from '@/application/ports/unit-of-work'
import type { JsonValue } from '@/domain/shared/json'
import type { Database, Executor } from './client'
import { DrizzleAccessGrantRepository } from './repositories/access-grant-repository'
import { DrizzleBusinessRepository } from './repositories/business-repository'
import { DrizzleFactWriter } from './repositories/fact-ledger'
import { DrizzleUserRepository } from './repositories/user-repository'
import { operations } from './schema'

/**
 * Atomicity and idempotency, in one primitive.
 *
 * Every use case runs inside `run`. Inside it:
 *
 *  - one PostgreSQL transaction wraps the whole operation, so the entity change
 *    and the facts it produces commit together or not at all;
 *  - the operations ledger claims the caller's idempotency key with an
 *    `INSERT ... ON CONFLICT DO NOTHING`. A second attempt with the same key does
 *    not re-execute the work: it returns the outcome the first attempt stored, so
 *    a retry cannot produce a second movement, a second charge or a second fact;
 *  - the operation id is handed to the fact writer, so every fact of the same
 *    operation is correlated.
 *
 * A failure rolls the whole transaction back, including the claim — so a genuine
 * retry after an error can run again.
 */
export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(
    private readonly db: Database,
    private readonly ids: IdGenerator,
  ) {}

  async run<T extends JsonValue>(
    command: OperationCommand,
    work: (tx: TransactionContext) => Promise<T>,
  ): Promise<OperationOutcome<T>> {
    return this.db.transaction(async (tx) => {
      const operationId = this.ids.operationId()

      const claimed = await tx
        .insert(operations)
        .values({
          id: operationId,
          businessId: command.businessId,
          type: command.type,
          idempotencyKey: command.idempotencyKey,
          status: 'COMPLETADA',
          result: sql`'null'::jsonb`,
        })
        .onConflictDoNothing()
        .returning({ id: operations.id })

      if (claimed.length === 0) {
        const previous = await findOperation(tx, command)
        if (!previous) {
          throw new Error(
            'The idempotency key is claimed by another operation type. Use a fresh key.',
          )
        }
        return {
          operationId: previous.id,
          replayed: true,
          result: previous.result as T,
        } satisfies OperationOutcome<T>
      }

      const context: TransactionContext = {
        operationId,
        businesses: new DrizzleBusinessRepository(tx),
        users: new DrizzleUserRepository(tx),
        accessGrants: new DrizzleAccessGrantRepository(tx),
        facts: new DrizzleFactWriter(tx, this.ids, operationId),
      }

      const result = await work(context)

      await tx
        .update(operations)
        .set({ result: result as JsonValue })
        .where(eq(operations.id, operationId))

      return { operationId, replayed: false, result } satisfies OperationOutcome<T>
    })
  }
}

async function findOperation(tx: Executor, command: OperationCommand) {
  const scope =
    command.businessId === null
      ? isNull(operations.businessId)
      : eq(operations.businessId, command.businessId)
  const [row] = await tx
    .select()
    .from(operations)
    .where(
      and(
        scope,
        eq(operations.idempotencyKey, command.idempotencyKey),
        eq(operations.type, command.type),
      ),
    )
    .limit(1)
  return row ? { id: row.id as OperationOutcome<never>['operationId'], result: row.result } : null
}

import {
  bigint,
  bigserial,
  date,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

/**
 * Enum policy: structural vocabularies that do not grow with a slice live as
 * Postgres enums; registries that every future slice extends (fact type, entity
 * type) are text columns owned by the domain registry, so adding a fact type does
 * not need a schema migration.
 */
export const businessRoleEnum = pgEnum('business_role', ['DUENO', 'CONTADOR'])
export const accessStatusEnum = pgEnum('access_status', ['ACTIVO', 'REVOCADO'])
export const actorTypeEnum = pgEnum('actor_type', ['USUARIO', 'SISTEMA'])
export const factOriginEnum = pgEnum('fact_origin', ['UI', 'API', 'SISTEMA', 'SEED'])
export const factLinkRoleEnum = pgEnum('fact_link_role', ['PRIMARIA', 'RELACIONADA'])
export const operationStatusEnum = pgEnum('operation_status', ['COMPLETADA'])

const createdAt = timestamp('created_at', { withTimezone: true, mode: 'date' })
  .notNull()
  .defaultNow()
const updatedAt = timestamp('updated_at', { withTimezone: true, mode: 'date' })
  .notNull()
  .defaultNow()

export const businesses = pgTable('businesses', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  /** PYG, whole guaraníes. Never a floating point column. */
  initialBalancePyg: bigint('initial_balance_pyg', { mode: 'number' }).notNull(),
  /** A declared calendar day, not an instant: stored as `date`. */
  initialBalanceDate: date('initial_balance_date').notNull(),
  createdAt,
  updatedAt,
})

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex('users_email_key').on(table.email)],
)

export const accessGrants = pgTable(
  'access_grants',
  {
    id: uuid('id').primaryKey(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: businessRoleEnum('role').notNull(),
    status: accessStatusEnum('status').notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true, mode: 'date' }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex('access_grants_business_user_key').on(table.businessId, table.userId),
    index('access_grants_business_idx').on(table.businessId),
  ],
)

/**
 * Operations ledger. One row per executed operation, keyed by the caller's
 * idempotency key. It is what makes a retry replay instead of duplicating, and it
 * is the correlation id every fact of that operation carries.
 *
 * `business_id` carries no foreign key on purpose: the row is written before the
 * business it creates exists, inside the very same transaction.
 */
export const operations = pgTable(
  'operations',
  {
    id: uuid('id').primaryKey(),
    businessId: uuid('business_id'),
    type: text('type').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    status: operationStatusEnum('status').notNull().default('COMPLETADA'),
    result: jsonb('result').notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex('operations_business_key_idx')
      .on(table.businessId, table.idempotencyKey)
      .where(sql`business_id is not null`),
    uniqueIndex('operations_platform_key_idx')
      .on(table.idempotencyKey)
      .where(sql`business_id is null`),
  ],
)

/**
 * Libro de Hechos — the single source of history. There is no per-module history
 * table and there never will be: a module appears in the ledger through its fact
 * type and its links.
 */
export const facts = pgTable(
  'facts',
  {
    id: uuid('id').primaryKey(),
    /**
     * Total order of the ledger. Two facts can share a fecha del hecho; the
     * sequence is what makes "newest first" deterministic and what keyset
     * pagination walks, so a page boundary never hides or repeats a fact.
     */
    seq: bigserial('seq', { mode: 'number' }).notNull(),
    businessId: uuid('business_id')
      .notNull()
      .references(() => businesses.id),
    type: text('type').notNull(),
    /** Fecha del hecho: when it happened. Metrics read this one. */
    occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' }).notNull(),
    /** Fecha de registro: when ARKAN learned about it. */
    recordedAt: timestamp('recorded_at', { withTimezone: true, mode: 'date' }).notNull(),
    actorType: actorTypeEnum('actor_type').notNull(),
    actorId: text('actor_id'),
    actorLabel: text('actor_label').notNull(),
    origin: factOriginEnum('origin').notNull(),
    primaryEntityType: text('primary_entity_type').notNull(),
    primaryEntityId: text('primary_entity_id').notNull(),
    summary: text('summary').notNull(),
    consequences: jsonb('consequences')
      .notNull()
      .default(sql`'[]'::jsonb`),
    metadata: jsonb('metadata')
      .notNull()
      .default(sql`'{}'::jsonb`),
    operationId: uuid('operation_id').references(() => operations.id),
    createdAt,
  },
  (table) => [
    unique('facts_id_business_key').on(table.id, table.businessId),
    index('facts_recent_idx').on(table.businessId, table.occurredAt.desc(), table.seq.desc()),
    index('facts_operation_idx').on(table.businessId, table.operationId),
    index('facts_type_idx').on(table.businessId, table.type),
  ],
)

/**
 * The index that gives a fact its contexts. One row per entity the fact touches;
 * the fact itself is stored once.
 *
 * The composite reference to `(fact_id, business_id)` is what makes a link
 * physically unable to point at a fact of another business.
 */
export const factLinks = pgTable(
  'fact_links',
  {
    factId: uuid('fact_id').notNull(),
    businessId: uuid('business_id').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    role: factLinkRoleEnum('role').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.factId, table.entityType, table.entityId] }),
    foreignKey({
      name: 'fact_links_fact_business_fk',
      columns: [table.factId, table.businessId],
      foreignColumns: [facts.id, facts.businessId],
    }),
    index('fact_links_entity_idx').on(table.businessId, table.entityType, table.entityId),
  ],
)

export type BusinessRow = typeof businesses.$inferSelect
export type UserRow = typeof users.$inferSelect
export type AccessGrantRow = typeof accessGrants.$inferSelect
export type FactRow = typeof facts.$inferSelect
export type FactLinkRow = typeof factLinks.$inferSelect
export type OperationRow = typeof operations.$inferSelect

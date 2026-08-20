import { notFound } from 'next/navigation'
import { getRecentActivity } from '@/application/queries/fact-queries'
import { formatPyg } from '@/domain/money/guarani'
import { businessId as parseBusinessId } from '@/domain/shared/ids'
import { BUSINESS_TIMEZONE } from '@/domain/time/time'
import { createAppDependencies } from '@/infrastructure/container'

export const dynamic = 'force-dynamic'

const formatter = new Intl.DateTimeFormat('es-PY', {
  timeZone: BUSINESS_TIMEZONE,
  dateStyle: 'short',
  timeStyle: 'short',
})

export default async function BusinessLedgerPage({
  params,
}: {
  params: Promise<{ businessId: string }>
}) {
  const { businessId: raw } = await params
  const deps = createAppDependencies()

  let id
  try {
    id = parseBusinessId(raw)
  } catch {
    notFound()
  }

  const business = await deps.read.businesses.findById(id)
  if (!business) notFound()

  const activity = await getRecentActivity(deps, { businessId: id, limit: 50 })

  return (
    <main>
      <h1>{business.name}</h1>
      <p>
        Saldo inicial declarado {formatPyg(business.initialBalancePyg)} al{' '}
        {business.initialBalanceDate}
      </p>

      <h2>Actividad reciente</h2>
      {activity.facts.length === 0 ? <p>Sin hechos registrados.</p> : null}
      {activity.facts.map((fact) => (
        <article className="card" key={fact.id}>
          <div className="fact-head">
            <span className="fact-type">{fact.type}</span>
            <span className="meta">
              <span>hecho: {formatter.format(fact.occurredAt)}</span>
              <span>registro: {formatter.format(fact.recordedAt)}</span>
            </span>
          </div>
          <p className="fact-summary">{fact.summary}</p>
          <div className="meta">
            <span>actor: {fact.actor.actorLabel}</span>
            <span>origen: {fact.origin}</span>
            <span>
              entidad: {fact.primaryEntity.entityType} · {fact.primaryEntity.entityId.slice(0, 8)}
            </span>
          </div>
          {fact.consequences.length > 0 ? (
            <ul className="consequences">
              {fact.consequences.map((consequence, index) => (
                <li key={index}>{describeConsequence(consequence)}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </main>
  )
}

function describeConsequence(
  consequence: Awaited<
    ReturnType<typeof getRecentActivity>
  >['facts'][number]['consequences'][number],
): string {
  switch (consequence.kind) {
    case 'ENTIDAD_CREADA':
      return `${consequence.entity.entityType} creada: ${consequence.label}`
    case 'ESTADO_CAMBIADO':
      return `${consequence.entity.entityType}.${consequence.field}: ${
        consequence.from ?? 'sin estado'
      } a ${consequence.to}`
    case 'MONTO_DECLARADO':
      return `${consequence.concept}: ${formatPyg(consequence.amountPyg)}`
  }
}

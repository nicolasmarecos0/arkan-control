export const dynamic = 'force-dynamic'

/**
 * Foundation shell. The interface layer owns no business rule: it only calls the
 * application layer and renders what it returns.
 */
export default function HomePage() {
  const demoBusinessId = process.env.ARKAN_DEMO_BUSINESS_ID

  return (
    <main>
      <h1>ARKAN Control</h1>
      <p>P2-A — Slice 1: cimientos técnicos y Libro de Hechos.</p>

      <div className="notice">
        <p>
          Esta build contiene únicamente los cimientos: negocio, acceso mínimo, Libro de Hechos,
          transacciones e idempotencia. No hay catálogo, ventas, inventario, cobros ni dashboard.
        </p>
        <p>
          Todavía no hay autenticación: la interfaz no impone control de acceso. El aislamiento por
          negocio se aplica en la capa de datos.
        </p>
      </div>

      <h2>Libro de Hechos</h2>
      {demoBusinessId ? (
        <p>
          Actividad reciente del negocio de prueba:{' '}
          <a href={`/negocios/${demoBusinessId}`}>/negocios/{demoBusinessId}</a>
        </p>
      ) : (
        <p>
          Ejecutá <code>npm run db:seed</code> para crear un negocio de prueba. El script imprime la
          URL <code>/negocios/&lt;id&gt;</code> con su historial.
        </p>
      )}
    </main>
  )
}

# ARKAN Control

Plataforma de gestión y control para negocios en Paraguay. Este repositorio contiene
la implementación de **P2-A**, construida por slices.

## Estado actual

**Slice 1 — Cimientos + Libro de Hechos.** Implementado y verde.
No hay todavía catálogo, ventas, inventario comercial, compras, cobros, gastos,
Posición registrada, dashboard ni interfaz de contador. Ver [alcance](#qué-no-está-implementado).

> La interfaz todavía no tiene autenticación. El aislamiento por negocio se aplica en
> la capa de datos y de aplicación; la UI no impone control de acceso porque la
> identidad de P2-A aún no está definida (Q-16 abierta).

## Cómo ejecutar

Requisitos: Node 22+, PostgreSQL 16+.

```bash
npm install
cp .env.example .env            # ajustar DATABASE_URL si hace falta
createdb arkan_control_dev
createdb arkan_control_test
npm run db:migrate              # aplica las migraciones
npm run db:seed                 # crea un negocio de prueba e imprime su URL
npm run dev                     # http://localhost:3000
```

`npm run db:seed` imprime el id del negocio de prueba. Su Libro de Hechos está en
`/negocios/<id>`. Poniendo ese id en `ARKAN_DEMO_BUSINESS_ID` la home enlaza directo.

## Cómo correr los tests

```bash
npm test          # suite completa (usa arkan_control_test)
npm run lint
npm run typecheck
npm run build
npm run verify    # los cuatro anteriores
```

Los tests corren contra un PostgreSQL real: las garantías que se verifican
(append-only, aislamiento por negocio, atomicidad) viven en la base de datos.
Si `TEST_DATABASE_URL` no está definida se usa
`postgres://postgres:postgres@127.0.0.1:5432/arkan_control_test`.

## Estructura

```
src/
  domain/          reglas y tipos del negocio; sin framework, sin SQL, sin I/O
    money/         guaraníes como enteros
    time/          fecha del hecho vs fecha de registro, calendario paraguayo
    tenancy/       aislamiento por negocio
    business/      Negocio
    access/        Usuario y acceso (DUENO / CONTADOR, ACTIVO / REVOCADO)
    facts/         Libro de Hechos: hecho, consecuencias, vínculos
  application/     casos de uso, consultas y puertos (repositorios, reloj, ids, UoW)
  infrastructure/  PostgreSQL + Drizzle, unidad de trabajo, composición
  app/             Next.js (interfaz); no contiene reglas de negocio
drizzle/           migraciones SQL versionadas
tests/             dominio, aplicación e infraestructura
docs/              fuentes, decisiones, convenciones
scripts/           migrate, seed, reset
```

La frontera está verificada por lint: `src/domain` no puede importar aplicación,
infraestructura ni framework, y `src/application` sólo depende de puertos.

## Fuentes de verdad

1. `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md` — disponible desde la Misión 1.1
2. `docs/sources/ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` — disponible desde el cierre de la Misión 1.1
3. `docs/missions/MISSION_1_BRIEF.md` y `docs/missions/MISSION_1.1_BRIEF.md` — contratos con los que se construyó y reconcilió este slice
4. `CLAUDE.md` — reglas de operación para trabajar en este repositorio

Ambas fuentes normativas fueron reconciliadas contra los cimientos del Slice 1 sin
encontrar incompatibilidades — ver `docs/DECISIONS.md`, sección "Reconciliación
Misión 1.1 (cierre)".

## Qué está implementado

- Negocio: nombre, saldo inicial declarado en PYG entero, fecha del saldo inicial.
- Usuario y acceso mínimo: roles `DUENO` y `CONTADOR`, estados `ACTIVO` y `REVOCADO`.
- Aislamiento por negocio en toda lectura y escritura de datos operativos.
- Libro de Hechos: fuente única de eventos, con actor, origen, fecha del hecho,
  fecha de registro, entidad primaria, entidades relacionadas, resumen legible y
  consecuencias estructuradas. Ver `docs/LIBRO_DE_HECHOS.md`.
- Historial contextual por entidad y actividad reciente del negocio, sobre las
  mismas filas: un hecho no se copia por contexto.
- Atomicidad: cada operación corre en una transacción; entidad y hechos se
  confirman juntos o no se confirma nada.
- Idempotencia: un reintento con la misma clave devuelve el resultado guardado y no
  vuelve a producir consecuencias.
- Sin borrado físico: los hechos son append-only a nivel de base de datos; revocar
  un acceso es un cambio de estado, no un delete.

## Qué NO está implementado

Catálogo, ventas, inventario comercial, compras, cobros, gastos, devoluciones,
merma, Posición registrada, dashboard, Asuntos, Business Health, evidencias, UI de
contador, P2-B, calendario, bancos, integraciones externas, SIFEN/DNIT,
facturación fiscal, IA, predicciones, pricing y landing.

Tampoco hay autenticación, sesiones ni matriz de permisos: Q-16 sigue abierta.

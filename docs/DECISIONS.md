# Decisiones técnicas — Slice 1

Sólo decisiones técnicas. Ninguna regla de dominio se decide acá.

## D-01 · Stack

Next.js 16 (App Router) + TypeScript estricto + PostgreSQL 16 + Drizzle ORM +
Zod 4 + Vitest.

Razones: un solo lenguaje y un solo despliegue para UI, casos de uso y datos;
migraciones SQL versionadas y legibles; validación y tipos derivados del mismo
esquema; PostgreSQL da transacciones, `jsonb` y triggers, que es exactamente lo que
el Libro de Hechos necesita. Sin microservicios, sin broker de eventos, sin colas:
Connection First se resuelve dentro de una transacción.

Drizzle sobre Prisma: el SQL generado es explícito y auditable, las migraciones son
archivos SQL que se pueden extender a mano (los triggers append-only lo requieren) y
no hay un motor de consultas en runtime.

## D-02 · Cuatro capas, frontera verificada por lint

`domain` (puro) → `application` (puertos y casos de uso) → `infrastructure`
(PostgreSQL) → `app` (Next.js). ESLint prohíbe que `domain` importe cualquier cosa de
aplicación, infraestructura o framework, y que `application` importe un driver
concreto. La frontera es una regla ejecutable, no una intención.

## D-03 · Unidad de trabajo con ledger de operaciones

`UnitOfWork.run(command, work)` abre una transacción, reclama la clave de
idempotencia con `INSERT ... ON CONFLICT DO NOTHING` sobre `operations`, ejecuta el
trabajo con repositorios atados a esa transacción y guarda el resultado.

- Falla el trabajo: rollback total, incluida la reclamación. Un reintento genuino
  puede volver a ejecutarse.
- Clave ya reclamada: se devuelve el resultado guardado con `replayed: true`, sin
  ejecutar consecuencias por segunda vez.
- El `operation_id` viaja en cada hecho de esa operación, que queda correlacionada.

El resultado guardado es JSON: los casos de uso devuelven identificadores, no
entidades, para que la reproducción no dependa de deserializar fechas.

## D-04 · Alcance de la clave de idempotencia

`operations.business_id` es el **alcance de la clave**, no necesariamente la entidad
afectada. Para operaciones que corren antes de que su negocio exista (registrar un
negocio) o fuera de todo negocio (registrar un usuario), el alcance es `null` y la
clave debe ser globalmente única — se espera un UUID. El id creado queda en el
resultado guardado.

Sin esto, un reintento de "registrar negocio" generaría un id nuevo, quedaría en otro
alcance y crearía un segundo negocio: la idempotencia sería decorativa.

## D-05 · Secuencia total del libro

`facts.seq` (`bigserial`) da un orden total. Dos hechos pueden compartir fecha del
hecho; ordenar por `(occurred_at desc, seq desc)` hace determinista el "más reciente
primero" y permite paginar por keyset sin repetir ni saltear filas. El id es un UUID
aleatorio y no sirve como desempate.

## D-06 · Append-only en la base, no en la convención

Triggers `BEFORE UPDATE OR DELETE` sobre `facts` y `fact_links` levantan excepción.
Un bug de aplicación no puede reescribir la historia.

## D-07 · Aislamiento con clave foránea compuesta

`fact_links (fact_id, business_id)` referencia `facts (id, business_id)`. Un vínculo
de un negocio no puede apuntar a un hecho de otro, con independencia del código.

## D-08 · Enums en Postgres sólo para vocabularios estables

Rol, estado de acceso, tipo de actor, origen y rol del vínculo son enums de
PostgreSQL. Tipo de hecho y tipo de entidad son `text`, con el registro dueño en el
dominio: cada slice agrega los suyos sin una migración de esquema.

## D-09 · Zona horaria

Instantes en UTC; días declarados como `date`. La presentación usa
`America/Asuncion` de forma explícita. Ninguna lógica depende de la zona del servidor.

## D-10 · Los tests corren contra PostgreSQL real

Las garantías bajo prueba (append-only, vínculos seguros por negocio, atomicidad)
viven en la base. Un doble en memoria probaría el doble. La suite corre archivo por
archivo sobre una única base de test.

## Supuestos pendientes de verificación

Se declaran porque los documentos normativos no estaban disponibles
(ver `docs/SOURCES.md`). Ninguno inventa una regla comercial; todos son
técnicos y reversibles:

1. **Vocabulario de `origin`**: `UI`, `API`, `SISTEMA`, `SEED`. El brief exige que el
   origen viaje con el hecho pero no fija el vocabulario. Es un enum, ampliable por
   migración.
2. **Nombres de los tipos de hecho y de las clases de consecuencia**: se eligieron
   descriptivos y en español. Si el contrato de eventos (sección 4 del Implementation
   Brief) fija otros nombres, hay que renombrar antes de acumular datos.
3. **Saldo inicial negativo**: no se prohíbe, porque ninguna fuente lo prohíbe. Se
   valida solamente que sea entero.
4. **Revocar dos veces**: es idempotente y no escribe un segundo hecho. Nada dice que
   deba fallar.
5. **Un usuario, un acceso por negocio**: el modelo impone unicidad
   `(business_id, user_id)`; volver a otorgar acceso a un usuario que ya lo tiene es
   un error, no un segundo registro. Un futuro "re-otorgar después de revocar"
   necesita una decisión de producto.
6. **Un usuario no es un dato de negocio**: la tabla `users` no lleva `business_id`
   (lo que ata a una persona con un negocio es el acceso), y crear un usuario no
   produce un hecho porque los hechos son siempre de un negocio.

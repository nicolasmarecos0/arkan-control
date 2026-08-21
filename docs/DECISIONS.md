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

## Supuestos pendientes de verificación (origen — Misión 1)

Se declararon porque los documentos normativos no estaban disponibles al construir
el Slice 1 (ver `docs/SOURCES.md`). Ninguno inventó una regla comercial; todos eran
técnicos y reversibles. Su reconciliación contra el Master Plan, ya disponible, está
en la sección siguiente.

1. **Vocabulario de `origin`**: `UI`, `API`, `SISTEMA`, `SEED`. El brief exigía que el
   origen viajara con el hecho pero no fijaba el vocabulario. Es un enum, ampliable
   por migración.
2. **Nombres de los tipos de hecho y de las clases de consecuencia**: se eligieron
   descriptivos y en español. Si el contrato de eventos (sección 4 del Implementation
   Brief) fija otros nombres, hay que renombrar antes de acumular datos.
3. **Saldo inicial negativo**: no se prohíbe, porque ninguna fuente lo prohibía. Se
   valida solamente que sea entero.
4. **Revocar dos veces**: es idempotente y no escribe un segundo hecho. Nada decía que
   debiera fallar.
5. **Un usuario, un acceso por negocio**: el modelo impone unicidad
   `(business_id, user_id)`; volver a otorgar acceso a un usuario que ya lo tiene es
   un error, no un segundo registro. Un futuro "re-otorgar después de revocar"
   necesita una decisión de producto.
6. **Un usuario no es un dato de negocio**: la tabla `users` no lleva `business_id`
   (lo que ata a una persona con un negocio es el acceso), y crear un usuario no
   produce un hecho porque los hechos son siempre de un negocio.

## Reconciliación Misión 1.1

Hecha contra `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md` (la versión "segunda
consolidación aplicada", D1..D19). El Implementation Brief **sigue sin estar
disponible** — ver `docs/SOURCES.md` para el detalle de qué no pudo verificarse por
esa razón. No se modificó código: no se encontró ninguna incompatibilidad real, sólo
confirmaciones y dos puntos que el Master Plan no cierra y quedan igual de abiertos
que antes.

### Doctrinas D9, D10, D17, D18, D19

| Doctrina                                                | Texto (Master Plan §2)                                                                                                                                          | Veredicto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D9** — un hecho se registra una sola vez              | "El usuario registra un hecho una vez; el resto del sistema se actualiza por conexión, no por doble carga."                                                     | **COMPATIBLE.** Es exactamente el diseño del Libro de Hechos: `tx.facts.append` escribe una fila; los contextos son lecturas filtradas por `fact_links`, nunca una segunda escritura.                                                                                                                                                                                                                                                                                                                                                                                                   |
| **D10** — trazabilidad total                            | "Todo movimiento importante debe poder responder: qué ocurrió, cuándo, quién, desde dónde, qué cambió. Una corrección nunca borra la historia silenciosamente." | **COMPATIBLE.** `Fact` responde las cinco preguntas por campo (`type`/`summary`, `occurredAt`, `actor`, `origin`, `consequences`); los triggers append-only impiden borrar o reescribir, y revocar un acceso es un hecho nuevo, no un borrado.                                                                                                                                                                                                                                                                                                                                          |
| **D17** — Connection First                              | Un hecho de negocio (ej. una venta) se propaga automáticamente a todas las áreas que afecta, conservando origen y trazabilidad.                                 | **NO APLICA TODAVÍA.** La propagación que describe D17 es entre entidades comerciales (venta → inventario → cliente → cobro → Posición → …) que el Slice 1 no implementa por alcance. La arquitectura sí está preparada para ella sin rediseño: `fact.relatedEntities` + `fact_links` permiten que un hecho quede indexado bajo varias entidades, y `UnitOfWork.run` permite que una operación futura escriba varias entidades y su hecho en la misma transacción. Se verificará en concreto recién cuando exista una operación que conecte más de dos entidades (Slice 2 en adelante). |
| **D18** — complejidad interna ≠ complejidad de interfaz | "La cantidad de entidades y conexiones internas nunca determina la cantidad de pantallas, módulos ni pasos que ve el usuario."                                  | **NO APLICA TODAVÍA.** La UI del Slice 1 no tiene navegación (una página de estado y una de historial por negocio, sin menú), así que no hay todavía una decisión de navegación que pueda violar D18. Queda como restricción a respetar cuando el Slice 2 agregue pantallas.                                                                                                                                                                                                                                                                                                            |
| **D19** — Fast Capture                                  | Flujo de venta de esfuerzo mínimo: producto/variante → cantidad → medio/estado de pago → confirmar.                                                             | **NO APLICA TODAVÍA.** Es una restricción de UX sobre el flujo de venta, que no existe en este slice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Convenciones transversales (Master Plan §4.1) contra `docs/CONVENTIONS.md`

El Master Plan dice, textual: _"Toda entidad operativa conserva: identificador,
negocio al que pertenece, fecha/hora del hecho, fecha/hora de registro, actor (quién),
origen (desde dónde/qué flujo la creó) y estado."_ — **COMPATIBLE**, coincide campo por
campo con lo implementado (`id`, `business_id`, `occurredAt`, `recordedAt`, `actor`,
`origin`, `status` cuando corresponde). También confirma, sin ajuste necesario:
"Fecha del hecho ≠ fecha de registro. Las métricas de período usan fecha del hecho"
(§4.1), "Nada se borra físicamente. Las correcciones son eventos nuevos" (§4.1),
"Un solo negocio por cuenta en P2" (§4.1) y "Arquitectura preparada para más de un
usuario desde el inicio" (§4.1). Y en §4.19: _"Todo movimiento importante es auditable
y responde: qué ocurrió, cuándo, quién, desde dónde/origen, qué cambió"_ — mismo
modelo que `Fact`.

### Los seis supuestos, reconciliados

| #   | Supuesto                                              | Veredicto                 | Base                                                                                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Vocabulario de `origin` (`UI`/`API`/`SISTEMA`/`SEED`) | **COMPATIBLE**            | El Master Plan exige el campo `origen` (§4.1) pero no fija su vocabulario cerrado — eso vive en el contrato de eventos del Implementation Brief, que sigue sin estar disponible. Nada en el Master Plan contradice los cuatro valores elegidos.                                                                                           |
| 2   | Nombres de tipos de hecho y clases de consecuencia    | **COMPATIBLE**            | Mismo caso: el Master Plan describe el modelo conceptualmente (§4.19, §5) pero no da un vocabulario cerrado de eventos. Los nombres elegidos (`NEGOCIO_CREADO`, `ENTIDAD_CREADA`, …) no contradicen nada; su cierre definitivo sigue dependiendo del Implementation Brief.                                                                |
| 3   | Saldo inicial negativo no prohibido                   | **COMPATIBLE**            | El Master Plan (§4.2) sólo dice "saldo inicial declarado"; la moneda entera está en `[PROPUESTA]` bajo Q-01 (no `[DECISIÓN]` todavía), y ninguna fuente prohíbe un valor negativo.                                                                                                                                                        |
| 4   | Revocar dos veces es idempotente                      | **COMPATIBLE**            | El Master Plan (§8.2) dice que el acceso del contador es "revocable" por el dueño, sin especificar el comportamiento ante una revocación repetida. No hay contradicción.                                                                                                                                                                  |
| 5   | Un usuario, un acceso por negocio                     | **COMPATIBLE**            | Consistente con "un solo negocio por cuenta en P2" (§4.1) y con el modelo de accesos de §8, que no contempla una relación N:M entre un usuario y un mismo negocio.                                                                                                                                                                        |
| 6   | Usuario sin `business_id` propio                      | **COMPATIBLE**, reforzado | El Master Plan (§8.2) describe al contador como un usuario que un dueño invita a _su_ negocio — el mismo patrón admite naturalmente que un contador atienda más de un negocio con cuentas separadas, lo que refuerza que la identidad del usuario deba vivir separada del negocio y que el vínculo sea el acceso, tal como se implementó. |

Ningún supuesto quedó en **REQUIERE AJUSTE**. Los puntos 1 y 2 son los únicos que
dependen de un cierre que el Master Plan no da — no porque lo contradiga, sino porque
esa numeración específica (contrato de eventos) pertenece al Implementation Brief, que
sigue sin haberse recibido (ver `docs/SOURCES.md`).

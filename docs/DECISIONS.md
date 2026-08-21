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

## Reconciliación Misión 1.1 (preliminar, sólo Master Plan)

> Superada por la sección "Reconciliación Misión 1.1 (cierre)" de abajo, hecha ya
> con el Implementation Brief disponible. Se conserva sin reescribir como registro
> de lo que se pudo verificar en ese momento con una sola fuente.

Hecha contra `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md` (la versión "segunda
consolidación aplicada", D1..D19). El Implementation Brief **seguía sin estar
disponible** en ese momento. No se modificó código: no se encontró ninguna
incompatibilidad real, sólo confirmaciones y dos puntos que el Master Plan no
cerraba y quedaban abiertos a la espera del Implementation Brief.

| Doctrina                                   | Veredicto (con sólo el Master Plan)                                       |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| **D9** — un hecho se registra una sola vez | COMPATIBLE — es el diseño del Libro de Hechos.                            |
| **D10** — trazabilidad total               | COMPATIBLE — `Fact` responde las cinco preguntas por campo.               |
| **D17** — Connection First                 | NO APLICA TODAVÍA — propagación comercial fuera de alcance de este slice. |
| **D18** — complejidad interna ≠ interfaz   | NO APLICA TODAVÍA — sin navegación que pueda violarla.                    |
| **D19** — Fast Capture                     | NO APLICA TODAVÍA — restricción del flujo de venta, inexistente.          |

Los seis supuestos declarados en la Misión 1 quedaron todos **COMPATIBLE** contra el
Master Plan, con los puntos 1 y 2 (vocabulario de `origin` y nombres de tipos de
hecho) señalados como dependientes de un cierre que sólo el Implementation Brief
podía dar.

## Reconciliación Misión 1.1 (cierre)

Hecha contra las dos fuentes ya disponibles:
`docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md` y
`docs/sources/ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` (el `_FINAL`, con
MP-049 a MP-053, los 18 invariantes de su §5 y Q-18 cerrada para P2-A). **No se
encontró ninguna incompatibilidad real entre los cimientos del Slice 1 y ninguna de
las dos fuentes. No se modificó código.**

### Doctrinas D9, D10, D17, D18, D19 — cierre

| Doctrina                                   | Veredicto             | Confirmación adicional del Implementation Brief                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D9** — un hecho se registra una sola vez | **COMPATIBLE**        | Brief §2.3: _"Fuente única. El Libro de Hechos lee la misma tabla de eventos que produce la auditoría. Prohibido duplicar datos para producir historiales."_ — exactamente `facts` + `fact_links`, sin tabla por módulo.                                                                                                                                              |
| **D10** — trazabilidad total               | **COMPATIBLE**        | Brief §2.3 fija la estructura invariable de todo hecho: _"qué ocurrió → cuándo → quién → origen → consecuencias"_ — son, en orden, `type`/`summary`, `occurredAt`, `actor`, `origin`, `consequences` de `Fact`.                                                                                                                                                       |
| **D17** — Connection First                 | **NO APLICA TODAVÍA** | El Brief la instancia en su §4 ("Mapa de propagación — contrato de eventos") con 13 eventos comerciales (Venta confirmada, Cobro posterior, Compra, …), ninguno de los cuales existe en este slice por alcance. El mecanismo que la soportará (`fact.relatedEntities` + `fact_links`, `UnitOfWork.run` transaccional multi-entidad) ya existe y no necesita rediseño. |
| **D18** — complejidad interna ≠ interfaz   | **NO APLICA TODAVÍA** | El Brief cierra Q-18 con una navegación de 5 áreas (§2) que este slice no construye — no hay pantallas que puedan violarla.                                                                                                                                                                                                                                           |
| **D19** — Fast Capture                     | **NO APLICA TODAVÍA** | El flujo de venta de esfuerzo mínimo (Brief §2.1, §3.4, §9) no existe en este slice.                                                                                                                                                                                                                                                                                  |

### Brief §3.1, §4, §5, §15 — cierre

- **§3.1 (moneda y montos, MP-035):** _"Moneda única: guaraní. Montos enteros, sin
  decimales."_ **COMPATIBLE**, cierra definitivamente Q-01 (que en el Master Plan
  era `[PROPUESTA]`) en el mismo sentido que ya estaba implementado: `Guarani` es un
  entero seguro, la columna es `bigint`, sin `float` en ninguna capa. El Brief separa
  además "montos de documento" (enteros) de "precisión decimal interna" para el
  costo promedio ponderado — no aplica todavía porque este slice no tiene costeo,
  y queda como nota para cuando exista.
- **§4 (mapa de propagación / contrato de eventos):** define 13 eventos
  **comerciales** (venta, cobro, compra, devolución, reembolso, …), ninguno de los
  cuales es un evento de este slice. **No contradice ni cierra** el vocabulario de
  los tres tipos de hecho ya implementados (`NEGOCIO_CREADO`, `ACCESO_OTORGADO`,
  `ACCESO_REVOCADO`) porque el Brief no los menciona — son fundacionales, anteriores
  a cualquier evento comercial. Cierra, en cambio, los supuestos 1 y 2 de la Misión 1
  de forma indirecta: el contrato de eventos exacto que se esperaba de esta sección
  es sobre eventos de negocio, no sobre eventos de cimientos, así que no hay
  vocabulario pendiente de renombrar.
- **§5 (18 invariantes verificables):** ver clasificación completa más abajo.
  Ninguno bloquea el Slice 1; casi todos dependen de entidades que este slice no
  construye por alcance.
- **§15 (handoff a construcción):** el primer punto del orden sugerido es, textual:
  _"1. Cimientos: negocio, usuarios/accesos, convenciones transversales, evento de
  historial (el Libro de Hechos se construye primero, no al final)."_ **Es
  exactamente el Slice 1**, en el orden exacto en que el Brief lo pide: primero
  cimientos, con el Libro de Hechos incluido desde el principio y no como
  añadido posterior. Los puntos 2 a 14 (Catálogo, Inventario, Compras, Ventas,
  Clientes/cobros, Correcciones, Dinero, Evidencia, Asuntos, INICIO, Business
  Health, capacidades ampliadas del contador, datos de prueba) son Slice 2 en
  adelante y no fueron tocados.

### Los diez puntos de verificación específica (tarea 8)

| Punto                                       | Veredicto      | Base                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modelo de tenancy                           | **COMPATIBLE** | Brief §3.1: "Un solo negocio por cuenta en P2-A".                                                                                                                                                                                                                                                                                                                                             |
| Vocabulario `origin`                        | **COMPATIBLE** | Ni el Master Plan ni el Brief fijan un vocabulario cerrado de `origin`; exigen el campo (§3.1), no sus valores. Nada contradice `UI`/`API`/`SISTEMA`/`SEED`.                                                                                                                                                                                                                                  |
| Contratos de eventos                        | **COMPATIBLE** | El contrato del Brief §4 es sobre eventos comerciales inexistentes en este slice; no colisiona con los tres tipos de hecho fundacionales implementados.                                                                                                                                                                                                                                       |
| Modelo temporal (`occurredAt`/`recordedAt`) | **COMPATIBLE** | Brief §3.1, textual, idéntico a lo implementado.                                                                                                                                                                                                                                                                                                                                              |
| PYG entero                                  | **COMPATIBLE** | Brief MP-035, cierre definitivo de Q-01, coincide con `Guarani`.                                                                                                                                                                                                                                                                                                                              |
| Atomicidad                                  | **COMPATIBLE** | Brief §4: _"[REGLA DERIVADA] Atomicidad. Una operación y todas sus consecuencias se confirman o fallan juntas."_ — es `UnitOfWork.run`.                                                                                                                                                                                                                                                       |
| Idempotencia                                | **COMPATIBLE** | Ninguna fuente la nombra explícitamente, pero es corolario necesario de D9 ("un hecho se registra una sola vez") bajo reintento; nada la contradice.                                                                                                                                                                                                                                          |
| Permisos DUENO/CONTADOR                     | **COMPATIBLE** | Brief MP-051: el contador "tiene lectura... no edita, no consume asiento, su actividad es trazable y visible, y el dueño puede revocar el acceso" — exactamente el modelo implementado. La matriz de capacidades granular (§8.1) no aplica todavía porque sus filas (ventas, gastos, compras) no existen; Q-16 sigue `[ABIERTO]` en el propio Brief, confirmando que no había que inventarla. |
| Libro de Hechos / `fact_links`              | **COMPATIBLE** | Brief §2.3, confirmación fuerte (ver tabla de D9 arriba).                                                                                                                                                                                                                                                                                                                                     |
| Fuente única de historial                   | **COMPATIBLE** | Mismo punto: "prohibido duplicar datos para producir historiales" — no existe, y no puede existir por diseño, una tabla de historial por módulo.                                                                                                                                                                                                                                              |

Ninguno de los diez exige un ajuste real. No se tocó código.

### Los seis supuestos — cierre definitivo

| #   | Supuesto                                  | Veredicto      | Cierre                                                                                                                                                                                               |
| --- | ----------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Vocabulario de `origin`                   | **COMPATIBLE** | Cerrado: ni el Master Plan ni el Brief fijan un vocabulario cerrado; el campo es obligatorio, sus valores son detalle de implementación no normado.                                                  |
| 2   | Nombres de tipos de hecho y consecuencias | **COMPATIBLE** | Cerrado: el contrato de eventos del Brief (§4) es sobre eventos comerciales; los tres tipos fundacionales implementados no están en conflicto porque el Brief no los define ni los necesita definir. |
| 3   | Saldo inicial negativo no prohibido       | **COMPATIBLE** | El Brief (§3.2) mantiene "saldo inicial declarado" sin restricción de signo; MP-035 sólo exige entero.                                                                                               |
| 4   | Revocar dos veces es idempotente          | **COMPATIBLE** | El Brief (MP-051) describe el acceso como revocable sin especificar el comportamiento ante repetición.                                                                                               |
| 5   | Un usuario, un acceso por negocio         | **COMPATIBLE** | El Brief (§3.1, §8.1) no contempla una relación N:M usuario-negocio dentro de un mismo negocio.                                                                                                      |
| 6   | Usuario sin `business_id` propio          | **COMPATIBLE** | Reforzado por el mismo modelo de invitación del Brief (§8.1: "Invitación → conexión → permisos mínimos → actividad visible → acceso revocable" — MP §5.12).                                          |

**Los seis quedan COMPATIBLE, cerrados, sin depender de ninguna fuente adicional.**

### Detalle menor observado, no incompatible

El Brief §3.2 lista "Usuario/Acceso: nombre, rol, estado" como fila resumen de la
tabla de entidades. El dominio implementado separa **Usuario** (`email`,
`displayName`) de **AccessGrant** (`role`, `status`) en dos tablas unidas por el
acceso. La tabla del Brief es un resumen de campos mínimos, no una prohibición de
campos adicionales — el propio §3 dice: _"cualquier campo adicional debe
justificarse con una consecuencia empresarial real"_ — y `email` es necesario para
identificar/invitar a una persona en un sistema multiusuario real. No requiere
ajuste.

### Los 18 invariantes del Brief §5 — clasificación

Ninguno bloquea el Slice 1. Diecisiete dependen de entidades que este slice no
construye por alcance (venta, compra, cobro, devolución, reembolso, Posición
registrada, Asunto, variante); uno ya es exigible y está implementado y testeado.

| #   | Invariante (resumen)                                               | Clasificación                 | Nota                                                                                                                                                                                                                                         |
| --- | ------------------------------------------------------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `stock(variante) = Σ movimientos(variante)`                        | PREPARADO ARQUITECTÓNICAMENTE | Requiere Variante e Inventario (Slice 2+).                                                                                                                                                                                                   |
| 2   | `Posición = saldo inicial + Σ movimientos`                         | PREPARADO ARQUITECTÓNICAMENTE | La precondición "saldo inicial declarado, entero" ya está implementada y validada en `Business`; los movimientos de Posición no existen aún.                                                                                                 |
| 3   | `Σ(subtotal−descuento) = total` en venta con descuento             | PREPARADO ARQUITECTÓNICAMENTE | Requiere Venta (Slice 2+).                                                                                                                                                                                                                   |
| 4   | `saldo(venta) = total − cobros − reducciones`                      | PREPARADO ARQUITECTÓNICAMENTE | Requiere Venta y Cobro.                                                                                                                                                                                                                      |
| 5   | `saldo(cliente) = Σ saldos de sus ventas`                          | PREPARADO ARQUITECTÓNICAMENTE | Requiere Cliente y Venta.                                                                                                                                                                                                                    |
| 6   | `netas = brutas − correcciones`                                    | PREPARADO ARQUITECTÓNICAMENTE | Requiere Venta y Corrección.                                                                                                                                                                                                                 |
| 7   | Venta anulada por error no aparece en brutas ni netas              | PREPARADO ARQUITECTÓNICAMENTE | Requiere Venta y `ERROR_DE_CARGA`.                                                                                                                                                                                                           |
| 8   | `costo_al_momento` nunca se modifica tras su creación              | PREPARADO ARQUITECTÓNICAMENTE | Requiere Línea de venta; el patrón de inmutabilidad ya es el usado en todo el dominio (`Fact`, `Business`, `AccessGrant` son objetos inmutables reconstruidos, nunca mutados en el lugar).                                                   |
| 9   | Todo movimiento derivado tiene operación de origen no nula         | **APLICABLE YA A CIMIENTOS**  | Ya implementado y testeado: todo `Fact` lleva `operationId` no nulo, asignado por `UnitOfWork.run`, correlacionable vía `factReader.byOperation` (`tests/application/fact-ledger.test.ts`, caso "correlaciona todo hecho de una operación"). |
| 10  | Toda cifra de INICIO se abre hasta sus operaciones                 | PREPARADO ARQUITECTÓNICAMENTE | INICIO no existe; el mismo principio ya vale para la página `/negocios/[businessId]`, que muestra cada hecho con sus consecuencias estructuradas.                                                                                            |
| 11  | Adjuntar evidencia no altera cifras previas                        | PREPARADO ARQUITECTÓNICAMENTE | Requiere Evidencia/Comprobante.                                                                                                                                                                                                              |
| 12  | Ningún margen sobre costo ausente tratado como 0                   | PREPARADO ARQUITECTÓNICAMENTE | Requiere costeo (Slice 2+).                                                                                                                                                                                                                  |
| 13  | Una variante nunca tiene A1 y A4 abiertos a la vez                 | PREPARADO ARQUITECTÓNICAMENTE | Requiere Variante y Asuntos.                                                                                                                                                                                                                 |
| 14  | Compra PAGADA ⇔ exactamente un PagoCompra por el total             | PREPARADO ARQUITECTÓNICAMENTE | Requiere Compra y PagoCompra.                                                                                                                                                                                                                |
| 15  | Todo PagoCompra tiene su movimiento de Posición                    | PREPARADO ARQUITECTÓNICAMENTE | Requiere PagoCompra y Posición registrada.                                                                                                                                                                                                   |
| 16  | Todo Reembolso conserva sus campos y su movimiento de Posición     | PREPARADO ARQUITECTÓNICAMENTE | Requiere Reembolso.                                                                                                                                                                                                                          |
| 17  | Devolución que sólo reduce saldo no genera Reembolso ni movimiento | PREPARADO ARQUITECTÓNICAMENTE | Requiere Devolución y Reembolso.                                                                                                                                                                                                             |
| 18  | Ningún A2 usa "vencido" sin vencimiento declarado                  | PREPARADO ARQUITECTÓNICAMENTE | Requiere Venta y Asuntos.                                                                                                                                                                                                                    |

### Conclusión de la reconciliación

Cero incompatibilidades. Cero supuestos en REQUIERE AJUSTE. Cero invariantes
bloqueados — el único exigible hoy (#9) ya pasa. Cero cambios de código.

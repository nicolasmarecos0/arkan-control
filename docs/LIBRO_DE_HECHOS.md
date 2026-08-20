# Libro de Hechos

El Libro de Hechos no es una entidad del negocio: es la lectura del historial único
del sistema. Un hecho se escribe una sola vez y se lee desde todos los contextos que
lo tocan.

## Fuente única

```
facts                 una fila por hecho
fact_links            una fila por (hecho, entidad): así el hecho se vuelve alcanzable
operations            una fila por operación ejecutada (correlación + idempotencia)
```

No hay `sale_history`, `product_history` ni `client_history`, y no los habrá. Cuando
un slice nuevo necesite historial, registra su tipo de hecho y sus vínculos; las
consultas ya existen.

## Qué responde un hecho

| Pregunta               | Campo                                        |
| ---------------------- | -------------------------------------------- |
| qué ocurrió            | `type` + `summary`                           |
| cuándo ocurrió         | `occurred_at` (fecha del hecho)              |
| cuándo se registró     | `recorded_at` (fecha de registro)            |
| quién                  | `actor_type`, `actor_id`, `actor_label`      |
| de dónde vino          | `origin`                                     |
| sobre qué              | `primary_entity_type` / `primary_entity_id`  |
| a qué más afecta       | `fact_links` (rol `RELACIONADA`)             |
| qué cambió             | `consequences` (JSON estructurado, no prosa) |
| con qué otra cosa vino | `operation_id`                               |
| de qué negocio es      | `business_id`                                |

Las consecuencias son una unión discriminada por `kind`, hoy con tres clases:
`ENTIDAD_CREADA`, `ESTADO_CAMBIADO` y `MONTO_DECLARADO`. Un slice que produzca un
movimiento de stock o de caja agrega su clase ahí; todo lector sigue funcionando.

## Contextos

Todos leen las mismas filas; lo único que cambia es el filtro.

| Contexto                       | Consulta                                          |
| ------------------------------ | ------------------------------------------------- |
| actividad reciente del negocio | `getRecentActivity({ businessId })`               |
| historial de una entidad       | `getEntityHistory({ businessId, entity })`        |
| hechos de una operación        | `factReader.byOperation(businessId, operationId)` |

Un mismo hecho de "acceso otorgado" aparece en el historial del acceso, en el del
usuario, en el del negocio y en la actividad reciente. Es una fila en `facts` y tres
en `fact_links`.

Orden: `occurred_at` descendente y, ante empate, `seq` descendente — `seq` es la
secuencia total del libro, que hace determinista el "más reciente primero" y permite
paginar por keyset sin repetir ni saltear hechos.

## Append-only

Dos triggers rechazan `UPDATE` y `DELETE` sobre `facts` y `fact_links`. Una
corrección futura será un hecho nuevo que referencia al anterior, nunca una
reescritura. `TRUNCATE` no pasa por los triggers y sólo se usa en `npm run db:reset`,
que es una herramienta de desarrollo local.

## Aislamiento

`fact_links` referencia `facts (id, business_id)` con una clave foránea compuesta: un
vínculo no puede apuntar a un hecho de otro negocio ni siquiera por error de código.
Toda consulta filtra además por `business_id`.

## Cómo extenderlo

1. Agregar el tipo en `src/domain/facts/fact-type.ts`.
2. Si hay una entidad nueva, agregarla en `src/domain/facts/entity-ref.ts`.
3. Si el cambio no encaja en las clases de consecuencia existentes, agregar la clase
   en `src/domain/facts/consequence.ts`.
4. Escribir el hecho con `tx.facts.append(...)` dentro de la misma transacción que
   produce el cambio.

Ninguno de esos pasos requiere una migración de esquema salvo el caso de una columna
nueva, que no debería hacer falta: lo variable vive en `consequences` y `metadata`.

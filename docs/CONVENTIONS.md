# Convenciones transversales

Toda entidad operativa futura las cumple. No son sugerencias.

## Identidad y pertenencia

- `id`: UUID generado por la aplicación, nunca por la base. Un reintento puede
  reutilizar el mismo id.
- `business_id`: obligatorio en todo dato operativo. Ninguna consulta lo omite.
  Los repositorios reciben el alcance; no existe un método que lea por id solo.

## Tiempo

- `occurred_at` — **fecha del hecho**: cuándo ocurrió en el mundo real. Las métricas
  leen esta.
- `recorded_at` — **fecha de registro**: cuándo ARKAN se enteró. Son campos
  independientes y no se colapsan nunca.
- Los instantes se guardan en UTC (`timestamptz`) y se manipulan como `Date`.
- Un día declarado por el negocio (fecha del saldo inicial, futuros cortes de
  período) se guarda como `date` `YYYY-MM-DD`, no como instante: así no se corre con
  una conversión de zona.
- El calendario del negocio es `America/Asuncion`. Convertir un instante a día es una
  llamada explícita a `toBusinessDate`; nada deriva un día de la zona horaria del
  servidor.

## Actor y origen

- `actor_type` (`USUARIO` | `SISTEMA`), `actor_id`, `actor_label`. Un hecho causado
  por una persona lleva su id; la etiqueta se congela en el momento del hecho.
- `origin`: `UI`, `API`, `SISTEMA` o `SEED`. Cómo entró el dato a ARKAN.

## Estado

- Donde hay estado, es un campo explícito con un vocabulario cerrado
  (`ACTIVO` / `REVOCADO` para el acceso).
- Desactivar no es borrar: el registro permanece y el cambio queda como hecho nuevo.

## Dinero

- PYG, entero. `Guarani` es un tipo con marca; se construye validando que el monto sea
  entero seguro. No se usa `float` en ninguna capa, y la columna es `bigint`.
- La aritmética permanece en enteros; multiplicar sólo por cantidades enteras.
- Sin multimoneda. El costeo promedio (que podrá necesitar precisión decimal interna)
  todavía no existe.

## Sin borrado físico

- Los hechos son append-only por trigger.
- Las correcciones futuras serán hechos nuevos.
- Desactivar ≠ eliminar el pasado.

## Validación

- Toda entrada externa pasa por un esquema Zod en el borde del caso de uso, antes de
  tocar el dominio. Los formularios y los requests no son de confianza.
- Los errores del dominio son tipados (`ValidationError`, `InvariantViolationError`,
  `TenantIsolationError`, `NotFoundError`) y llevan código y detalle.

## Atomicidad e idempotencia

- Toda operación corre dentro de `unitOfWork.run`: una transacción de PostgreSQL.
  La entidad y sus hechos se confirman juntos o no se confirma nada.
- Toda operación declara una clave de idempotencia. Un segundo intento con la misma
  clave devuelve el resultado guardado sin volver a ejecutar consecuencias.

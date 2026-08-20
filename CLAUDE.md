# CLAUDE.md — reglas de operación en `arkan-control`

Este documento dice **cómo trabajar** en este repositorio. No define reglas de
dominio: esas viven en los documentos fuente (`docs/SOURCES.md`).

## 1. Antes de escribir código

1. Leer `docs/SOURCES.md`. Si un documento normativo falta, decirlo — no
   reconstruirlo de memoria.
2. Leer `docs/CONVENTIONS.md` y `docs/LIBRO_DE_HECHOS.md`.
3. Si aparece una contradicción real, o hace falta una decisión que no existe en
   ninguna fuente: **detenerse y reportarla**. No resolverla en silencio.

## 2. Reglas que no se rompen

| #   | Regla                                                               | Dónde vive                        |
| --- | ------------------------------------------------------------------- | --------------------------------- |
| 1   | Un hecho se registra una sola vez y se lee desde muchos contextos   | `src/domain/facts`, `fact_links`  |
| 2   | No existe una tabla de historial por módulo                         | `facts` es la fuente única        |
| 3   | Fecha del hecho ≠ fecha de registro; las métricas leen la del hecho | `occurred_at` / `recorded_at`     |
| 4   | Todo dato operativo lleva `business_id` y toda consulta lo filtra   | repositorios y lector de hechos   |
| 5   | Nada del dominio se borra físicamente para fingir que no ocurrió    | triggers append-only, estados     |
| 6   | El dinero es entero en PYG; nunca `float`                           | `src/domain/money`                |
| 7   | Toda entrada externa se valida antes de entrar al dominio           | esquemas Zod en los casos de uso  |
| 8   | Una operación se confirma entera o no se confirma                   | `UnitOfWork`                      |
| 9   | La UI no es dueña de ninguna regla de negocio                       | `src/app` sólo llama casos de uso |

## 3. Dónde va cada cosa

- **Regla del negocio** → `src/domain`. Sin SQL, sin framework, sin I/O.
- **Orquestación de una operación** → `src/application/use-cases`. Valida la
  entrada, corre dentro de `unitOfWork.run` y escribe el hecho en el mismo bloque.
- **Consulta de lectura** → `src/application/queries`.
- **SQL, driver, mapeo** → `src/infrastructure`.
- **Pantalla o endpoint** → `src/app`. Sólo compone y renderiza.

El lint impone estas fronteras; si una importación falla, la solución es mover la
regla, no relajar el lint.

## 4. Cómo se agrega una operación nueva

1. Modelar el cambio en el dominio (entidad, invariantes, tipos).
2. Registrar el tipo de hecho en `src/domain/facts/fact-type.ts` y, si aparece una
   entidad nueva, en `entity-ref.ts`. Si la operación produce una consecuencia de
   una clase que no existe, agregarla en `consequence.ts`.
3. Escribir el caso de uso: validación Zod, `unitOfWork.run` con clave de
   idempotencia, cambio de estado y `tx.facts.append` en la misma transacción.
4. Tests: caso feliz, validación, aislamiento entre negocios, atomicidad ante
   fallo, e idempotencia ante reintento.
5. `npm run verify` antes de cerrar.

## 5. Control de cambios

- Commits pequeños y semánticos; no mezclar documentación, infraestructura y
  feature grande en un mismo commit cuando puedan separarse.
- No adelantar features fuera del slice en curso, aunque parezcan fáciles.
- El worktree queda limpio al terminar.

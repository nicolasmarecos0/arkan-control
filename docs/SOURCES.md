# Fuentes de verdad

## Estado de las fuentes normativas

| Documento                                       | Estado            | Ubicación                                        |
| ----------------------------------------------- | ----------------- | ------------------------------------------------ |
| `ARKAN_CONTROL_MASTER_PLAN_v1.0.md`             | **Disponible**    | `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md` |
| `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` | **NO DISPONIBLE** | —                                                |
| `docs/missions/MISSION_1_BRIEF.md`              | Disponible        | este repositorio                                 |
| `docs/missions/MISSION_1.1_BRIEF.md`            | Disponible        | este repositorio                                 |
| `CLAUDE.md`                                     | Disponible        | este repositorio                                 |

## Misión 1.1 — qué se recibió y qué sigue faltando

En la Misión 1.1 se recibieron dos archivos, ambos titulados internamente
`ARKAN_CONTROL_MASTER_PLAN_v1.0`:

- uno con el estado `documento central consolidado — v1.0` (doctrinas `D1..D16`);
- otro con el estado `documento central consolidado — v1.0 (segunda consolidación
aplicada)` (doctrinas `D1..D19`, con las enmiendas CF-09, CF-10 y CF-11 aplicadas
  sobre la primera versión).

**No se recibió ningún archivo correspondiente a
`ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`.** Se verificó el contenido completo
de ambos archivos subidos: ninguno se titula, ni en el nombre ni en el encabezado
interno, como Implementation Brief; ambos son versiones sucesivas del mismo Master
Plan. Esto se reporta explícitamente en vez de asumirse resuelto — ver
`docs/DECISIONS.md`, sección "Reconciliación Misión 1.1", para el detalle de qué
quedó sin poder verificarse por esta razón.

Se incorporó al repositorio la versión **más reciente y más completa** de las dos
(la de "segunda consolidación aplicada", que amplía y enmienda a la primera y no la
contradice) como `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md`, copiada byte a
byte del archivo recibido. La primera versión no se incorporó por separado: es un
subconjunto estricto de doctrinas (`D1..D16` contra `D1..D19`) sin decisiones propias
que la segunda no conserve o enmiende explícitamente (ver sus propios `CF-09`,
`CF-10`, `CF-11`), así que conservarla junto a su reemplazo sólo duplicaría contenido
histórico sin agregar una fuente normativa distinta.

## Qué significa "NO DISPONIBLE" para el Implementation Brief

El brief de la Misión 1 original describía el Implementation Brief como el documento
que contiene, entre otras cosas, la sección 3.1 (alcance de P2-A), la sección 4
(contrato de eventos), la sección 5 (con un conjunto de invariantes) y la sección 15
(orden de construcción). Nada de eso existe en el Master Plan disponible bajo esa
numeración:

- el Master Plan tiene su **propia** sección 3.1, pero es "Cliente" (el ICP de
  validación), no el alcance de P2-A — el alcance de P2-A vive en la sección 9.3;
- el Master Plan no tiene una sección 4 de "contrato de eventos": su sección 4 es
  "Modelo de dominio" completo, y el modelo del hecho vive dentro de 4.1 y 4.19;
- el Master Plan no tiene una lista de invariantes en su sección 5: la sección 5 es
  el "Mapa de conexiones" (los efectos que dispara cada operación futura). Sí existe
  una lista de veinte condiciones en la sección 13.5, "Condiciones para declarar P2
  listo para un primer negocio real" — pero es un checklist de cierre de **todo P2**,
  no una lista de invariantes de construcción, y casi todos sus puntos son de Slice 2
  en adelante (venta, devolución, compra, Business Health);
- el Master Plan no tiene una sección 15 ni ningún "orden de construcción" a nivel de
  implementación: su Roadmap (sección 11) da la secuencia de **slices** (P2-A → P2-B
  → piloto), no un orden interno de construcción dentro de un slice.

Esto confirma que el Implementation Brief es un documento distinto del Master Plan,
con su propia numeración de secciones, y que sigue sin haberse recibido. No se
inventó su contenido ni se asumió que el Master Plan lo reemplaza.

## Consecuencia práctica

Antes de comenzar el Slice 2 (Catálogo) sigue haciendo falta **incorporar
`ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`** a este repositorio. El Master Plan
ya disponible cubre razonablemente D9, D10, D17, D18, D19 y las convenciones
transversales (§4.1) que el Slice 1 necesitaba, y la reconciliación contra él no
encontró incompatibilidades — ver `docs/DECISIONS.md`. Lo que el Master Plan no cubre,
y el Slice 2 sí va a necesitar, es el contrato de eventos exacto (vocabulario cerrado
de tipos de hecho y de consecuencias) y el modelo de dominio del catálogo en detalle
de implementación, que corresponden al Implementation Brief.

`ARKAN_RECOVERY_AUDIT.md` no forma parte de este paquete. Si se incorpora, es
referencia histórica: nunca fuente normativa superior.

# Fuentes de verdad

## Estado de las fuentes normativas

| Documento                                       | Estado         | Ubicación                                                    |
| ----------------------------------------------- | -------------- | ------------------------------------------------------------ |
| `ARKAN_CONTROL_MASTER_PLAN_v1.0.md`             | **Disponible** | `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md`             |
| `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` | **Disponible** | `docs/sources/ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` |
| `docs/missions/MISSION_1_BRIEF.md`              | Disponible     | este repositorio                                             |
| `docs/missions/MISSION_1.1_BRIEF.md`            | Disponible     | este repositorio                                             |
| `CLAUDE.md`                                     | Disponible     | este repositorio                                             |

Las dos fuentes normativas están disponibles desde el cierre de la Misión 1.1. El
Implementation Brief es el **contrato final de construcción** de P2-A; el Master Plan
es su **fuente conceptual**. Ante una discrepancia entre ambos, el Implementation
Brief mismo declara la precedencia del Master Plan (§0.2), y aclara que él no crea
doctrina nueva — sólo deriva, precisa y cierra lo necesario para construir.

## Qué se recibió, en tres tandas

1. **Misión 1** (bootstrap): ningún documento normativo disponible. El Slice 1 se
   construyó únicamente con `docs/missions/MISSION_1_BRIEF.md`.
2. **Misión 1.1, primera entrega**: dos archivos, ambos titulados internamente
   `ARKAN_CONTROL_MASTER_PLAN_v1.0` — dos versiones sucesivas del mismo documento
   (una con doctrinas `D1..D16`, otra "segunda consolidación aplicada" con
   `D1..D19` que amplía y enmienda a la primera vía `CF-09`, `CF-10`, `CF-11`). Se
   incorporó la más completa de las dos como
   `docs/sources/ARKAN_CONTROL_MASTER_PLAN_v1.0.md`, copiada byte a byte
   (verificado con `diff`). La versión anterior no se conservó por separado: es un
   subconjunto estricto sin decisiones propias que la segunda no enmiende, y
   conservarla sólo duplicaría contenido histórico. El Implementation Brief **no**
   estaba entre los archivos de esta tanda — se reportó como bloqueo real, no se
   asumió resuelto.
3. **Misión 1.1, segunda entrega**: `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0_FINAL.md`,
   incorporado con el sufijo `_FINAL` retirado (pertenece al archivo de
   transferencia, no al nombre normativo) como
   `docs/sources/ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`, también copiado
   byte a byte y verificado con `diff`. Contiene las 18 secciones + 3 anexos
   descritos por el propio documento: §3.1 (moneda y montos, MP-035), §4 (mapa de
   propagación / contrato de eventos), §5 (18 invariantes verificables, contados
   uno por uno), §15 (handoff a construcción / orden de construcción), MP-049 a
   MP-053, y Q-18 cerrada para P2-A. Verificado explícitamente antes de tocar
   ningún archivo.

## Nota sobre el estado formal del Master Plan incorporado

El Implementation Brief se autodescribe con fuente conceptual
`ARKAN_CONTROL_MASTER_PLAN_v1.0 — APPROVED / FROZEN` (encabezado, línea 7). El
archivo de Master Plan efectivamente recibido e incorporado **no lleva ese texto
literal** en su propio encabezado (dice "documento central consolidado — v1.0
(segunda consolidación aplicada)"). Esto no es una inconsistencia introducida acá:
el propio Implementation Brief lo señala como pendiente en su **Anexo A / CF-14**
("normalizar nombre de archivo... y marcarlo APPROVED / FROZEN... evitar que
convivan variantes del mismo archivo" — "NUEVO — DOCUMENTAL"). Es decir, las
fuentes mismas documentan que ese sello formal todavía no se aplicó al archivo, con
independencia de esta reconciliación. En contenido, el archivo incorporado es la
única versión recibida que contiene D17, D18 y D19 y que el Implementation Brief no
contradice en ningún punto verificado — ver `docs/DECISIONS.md`.

## Consecuencia práctica

Las dos fuentes normativas están incorporadas y ya no bloquean el inicio del
Slice 2. La reconciliación completa contra ambas — los seis supuestos declarados en
la Misión 1, las doctrinas D9/D10/D17/D18/D19, y los 18 invariantes del
Implementation Brief clasificados por aplicabilidad — está en `docs/DECISIONS.md`,
sección "Reconciliación Misión 1.1 (cierre)".

`ARKAN_RECOVERY_AUDIT.md` no forma parte de este paquete. Si se incorpora, es
referencia histórica: nunca fuente normativa superior (esto también lo confirma el
propio Implementation Brief, Anexo A: _"no se modifica: es registro histórico...
no como norma vigente"_).

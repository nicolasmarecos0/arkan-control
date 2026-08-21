# ARKAN CONTROL — MISIÓN 1.1

> Brief operativo de la reconciliación documental posterior al Slice 1. Archivado
> como registro del contrato con el que se hizo esta reconciliación.

## Contexto

Los 7 commits de la Misión 1 quedaron publicados en GitHub bajo `feat/bootstrap-foundations`.
Se recibieron dos archivos presentados como las fuentes normativas finales:
`ARKAN_CONTROL_MASTER_PLAN_v1.0.md` (APPROVED / FROZEN) y
`ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` (contrato final de construcción).

## Objetivo

Cerrar exclusivamente el bloqueo documental de la Misión 1 y verificar que los
cimientos ya implementados son compatibles con las fuentes finales. No comenzar
Slice 2. No hacer merge a main. No ampliar alcance.

## Tareas

1. Leer completas, en este orden: el Master Plan, el Implementation Brief,
   `CLAUDE.md`, `docs/SOURCES.md`, `docs/DECISIONS.md`,
   `docs/missions/MISSION_1_BRIEF.md`.
2. Reconciliar específicamente: D9, D10, D17, D18, D19, Implementation Brief §3.1,
   contrato de eventos / Libro de Hechos, los 18 invariantes finales, orden de
   construcción, y los seis "Supuestos pendientes de verificación" de
   `docs/DECISIONS.md`.
3. Clasificar cada supuesto como COMPATIBLE, REQUIERE AJUSTE o NO APLICA TODAVÍA.
4. No cambiar código si ya cumple el contrato. Modificar solamente lo
   estrictamente necesario si existe una incompatibilidad real.
5. Incorporar las dos fuentes normativas al repositorio y actualizar
   `docs/SOURCES.md` para que dejen de figurar como NO DISPONIBLES.
6. No implementar catálogo, productos, variantes, inventario comercial, ventas,
   compras, cobros, gastos, devoluciones, Posición registrada, Asuntos, Business
   Health ni ninguna funcionalidad del Slice 2.
7. Si se encuentra una contradicción real entre las fuentes finales y los cimientos
   implementados: detenerse, describirla claramente y no inventar una solución.
8. Si se realiza cualquier cambio, ejecutar nuevamente `npm test`, `npm run lint`,
   `npm run typecheck` y `npm run build`.
9. Entregar informe final con la reconciliación de los seis supuestos, las
   incompatibilidades encontradas si existen, los archivos modificados, los cambios
   realizados, el resultado de tests/lint/typecheck/build, los bloqueos restantes,
   el estado del worktree y el HEAD final.
10. Terminar exactamente con `READY FOR SLICE 2 — CATALOG` o
    `NOT READY FOR SLICE 2 — CATALOG`.

## Resultado (primera entrega)

Se recibieron dos archivos, ambos internamente titulados
`ARKAN_CONTROL_MASTER_PLAN_v1.0` (dos versiones sucesivas del mismo documento, no un
Master Plan y un Implementation Brief distintos). El Implementation Brief no fue
recibido. Ver `docs/SOURCES.md` para el detalle completo y `docs/DECISIONS.md`,
sección "Reconciliación Misión 1.1 (preliminar, sólo Master Plan)", para la
clasificación de los seis supuestos y de las doctrinas D9/D10/D17/D18/D19 contra el
Master Plan efectivamente disponible en ese momento.

## Cierre — segunda entrega

Se recibió `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0_FINAL.md`. Tareas de cierre:

1. Verificar el contenido del Implementation Brief antes de tocar cualquier
   archivo, confirmando la presencia de §3.1 (moneda y montos), §4 (mapa de
   propagación / contrato de eventos), §5 (18 invariantes verificables), §15
   (handoff a construcción), MP-049 a MP-053, y Q-18 cerrada para P2-A.
2. Confirmar que la copia del Master Plan ya incorporada era la versión con D17,
   D18 y D19 (lo era; no hizo falta reemplazarla — la otra versión recibida, sin
   esas doctrinas, nunca se había incorporado).
3. Incorporar el Implementation Brief con el sufijo `_FINAL` retirado, como
   `docs/sources/ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`.
4. Actualizar `docs/SOURCES.md`: ambas fuentes normativas `Disponible`.
5. Rehacer la reconciliación de los seis supuestos con ambas fuentes completas.
6. Reconciliar los cimientos contra D9/D10/D17/D18/D19, Brief §3.1/§4/§5/§15,
   Libro de Hechos como fuente única, tenancy, roles, modelo temporal, PYG entero,
   atomicidad, idempotencia y ausencia de hard delete.
7. Clasificar los 18 invariantes en APLICABLE YA A CIMIENTOS o PREPARADO
   ARQUITECTÓNICAMENTE / SE VERIFICA EN SLICE POSTERIOR.
8. Verificar diez puntos específicos por si exigían un ajuste real de los
   cimientos.
9. No implementar ninguna funcionalidad de Slice 2. No push. No merge. No
   reescribir el commit `308a8ff`: cualquier corrección, en un commit nuevo.

## Resultado (cierre)

Cero incompatibilidades encontradas entre los cimientos del Slice 1 y ninguna de
las dos fuentes normativas, ya ambas disponibles. Cero código modificado. Los seis
supuestos, las cinco doctrinas y los diez puntos específicos cerraron todos
`COMPATIBLE`; de los 18 invariantes del Brief, 17 son `PREPARADO
ARQUITECTÓNICAMENTE` (dependen de entidades de Slice 2 en adelante) y 1 ya es
`APLICABLE YA A CIMIENTOS` y está implementado y testeado. Ver `docs/DECISIONS.md`,
sección "Reconciliación Misión 1.1 (cierre)", y `docs/SOURCES.md` para el detalle
completo.

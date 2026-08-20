# Fuentes de verdad

## Estado de las fuentes normativas

| Documento                                       | Estado            | Ubicación        |
| ----------------------------------------------- | ----------------- | ---------------- |
| `ARKAN_CONTROL_MASTER_PLAN_v1.0.md`             | **NO DISPONIBLE** | —                |
| `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md` | **NO DISPONIBLE** | —                |
| `docs/missions/MISSION_1_BRIEF.md`              | Disponible        | este repositorio |
| `CLAUDE.md`                                     | Disponible        | este repositorio |

## Qué significa "NO DISPONIBLE"

Al construir el Slice 1, los dos documentos normativos no existían en este
repositorio ni en ningún otro lugar accesible del entorno (se verificó el
repositorio `arkan-control` completo, sus ramas, y el repositorio
`gestio-digital-brain`, que contiene el corpus de Gestio y ninguna referencia a
ARKAN Control).

**El Slice 1 se construyó exclusivamente con el brief de la Misión 1**, archivado
verbatim en `docs/missions/MISSION_1_BRIEF.md`, que enumera de forma autónoma las
convenciones, el modelo del hecho, los roles, los estados, las reglas de dinero y
tiempo, y la lista de tests exigidos. No se reconstruyó de memoria ningún contenido
del Master Plan ni del Implementation Brief, y ninguna regla de dominio fuera de ese
brief fue inventada.

## Consecuencia práctica

Antes de comenzar el Slice 2 (Catálogo) hay que **incorporar los dos documentos
faltantes a este repositorio** y reconciliar contra ellos lo construido en el Slice 1,
en particular:

- los principios D9, D10, D17, D18 y D19, referenciados por número en el brief de la
  Misión 1 pero cuyo texto normativo no está disponible aquí;
- la sección 3.1 (alcance de P2-A), la sección 4 (contrato de eventos), la sección 5
  (invariantes) y la sección 15 (orden de construcción) del Implementation Brief.

Los puntos del Slice 1 que dependen de esos textos y hoy son **supuestos declarados**
están listados en `docs/DECISIONS.md`, sección "Supuestos pendientes de verificación".

`ARKAN_RECOVERY_AUDIT.md` no forma parte de este paquete. Si se incorpora, es
referencia histórica: nunca fuente normativa superior.

# ARKAN CONTROL — MISIÓN 1

> Brief operativo con el que se construyó el Slice 1. Archivado como registro del
> contrato de construcción. Los documentos normativos que este brief referencia
> (`ARKAN_CONTROL_MASTER_PLAN_v1.0.md` y
> `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`) no estaban disponibles en el
> entorno: ver `docs/SOURCES.md`.

Bootstrap técnico + fundamentos + Libro de Hechos.

La fuente conceptual es `ARKAN_CONTROL_MASTER_PLAN_v1.0.md` — APPROVED / FROZEN.
El contrato de construcción es `ARKAN_CONTROL_P2_IMPLEMENTATION_BRIEF_v1.0.md`.
No inventar reglas de dominio fuera de esos documentos. Ante una contradicción real o
una decisión que no existe: detenerse y reportarla; no resolver en silencio.

## Objetivo

Construir exclusivamente los cimientos técnicos de P2-A, incluyendo desde el
principio el sistema de historial / Libro de Hechos. Al terminar: una base
ejecutable, testeada, limpia, preparada para múltiples usuarios y para trazabilidad
completa, con separación clara entre dominio, persistencia, aplicación e interfaz, y
lista para comenzar el Slice 2 (Catálogo).

## 1. Leer fuentes

Leer el Master Plan, el Implementation Brief y `CLAUDE.md`. Identificar D9 (un hecho
se registra una sola vez), D10 (trazabilidad total), D17 (Connection First), D18
(complejidad interna ≠ complejidad visible), D19 (Fast Capture), la sección 3.1 del
Implementation Brief, la sección 4 (contrato de eventos), la sección 5 (invariantes)
y la sección 15 (orden de construcción).

## 2. Repositorio

Crear `arkan-control`. No modificar Gestio ni reutilizarlo como base: ARKAN Control es
un producto independiente. Inspeccionar el entorno disponible y proponer un stack
adecuado para construir rápido P2-A: stack moderno, mantenible, simple, buena DX,
TypeScript si resulta razonable, tipado fuerte, validación de datos, migraciones
reproducibles, tests automatizados, arquitectura suficiente para SaaS multiusuario y
sin sobrearquitectura enterprise. Sin microservicios, sin infraestructura distribuida
innecesaria, sin event brokers externos. Connection First no significa microservicios:
las conexiones pueden ocurrir transaccionalmente dentro de una arquitectura modular.

## 3. Decisión de stack

Elegir por velocidad de construcción, correctitud, mantenibilidad, facilidad para
continuar, facilidad de deploy y capacidad futura SaaS. Documentar brevemente la
razón. No usar una tecnología sólo porque sea sofisticada.

## 4. Estructura

Separar al menos conceptualmente: dominio, aplicación/casos de uso, persistencia, UI,
eventos/historial y tests. Las reglas empresariales no pueden quedar enterradas en
componentes React ni en handlers HTTP. La UI no es dueña de crear movimientos,
calcular stock, propagar consecuencias ni mantener auditoría.

## 5. Multitenancy desde el principio

P2-A tiene un negocio por cuenta, con arquitectura preparada para múltiples usuarios
(dueño y contador). Todo dato empresarial asociado a `business_id` o equivalente. Una
operación de un negocio jamás puede afectar o leer datos de otro. Tests básicos de
aislamiento donde corresponda.

## 6. Identidad y acceso — mínimo

**Negocio**: id, nombre, saldo inicial declarado, fecha del saldo inicial, timestamps.
**Usuario / acceso**: roles `DUENO` y `CONTADOR`; estados activo y revocado. Sin RBAC
granular: Q-16 continúa abierta; se puede preparar la arquitectura para permisos
futuros, pero no inventar la matriz.

## 7. Convenciones transversales obligatorias

Toda entidad operativa futura debe soportar `id`, `business_id`, `fecha_del_hecho`,
`fecha_de_registro`, `actor`, `origen` y `estado` cuando corresponda.
Regla crítica: fecha del hecho ≠ fecha de registro. Las métricas futuras usan la fecha
del hecho. No mezclar semánticamente ambos conceptos.

## 8. No hard delete

Nada importante del dominio se borra físicamente para fingir que nunca ocurrió.
Preparar las convenciones para que las correcciones futuras sean eventos nuevos, la
historia no desaparezca y desactivar no sea eliminar el pasado.

## 9. Libro de Hechos

Implementar desde el inicio el sistema transversal de eventos de historial. El Libro
de Hechos no es una entidad empresarial nueva: es una vista/reutilización del
historial. Debe existir una fuente única de eventos. Cada evento responde qué ocurrió,
cuándo, quién, origen y consecuencias, y permite conocer las entidades relacionadas.

## 10. Modelo conceptual del evento

Como mínimo: id, business_id, tipo de evento, fecha del hecho, fecha de registro,
actor, origen, entidad primaria, entidades relacionadas, resumen comprensible,
consecuencias estructuradas, metadata y correlación/operation_id. No almacenar sólo
texto plano; tampoco crear un sistema genérico imposible de usar.

## 11. Fuente única

No crear una tabla de historial por módulo (`sale_history`, `product_history`,
`client_history`...). El Libro de Hechos lee de una fuente única filtrada por
relaciones. Una misma operación debe poder aparecer en actividad reciente, dentro de
un cliente, dentro de una variante y dentro de una venta sin copiar el evento cuatro
veces.

## 12. Atomicidad

Preparar el patrón transaccional que usarán las operaciones futuras: venta →
inventario → cobro → Posición → historial se confirma junto o falla junto. No puede
existir venta sin movimiento de inventario, cobro sin movimiento de Posición, ni
operación sin historial cuando el historial sea obligatorio. En esta misión se
implementa y prueba el mecanismo sobre un caso mínimo.

## 13. Idempotencia / doble ejecución

Evitar consecuencias duplicadas ante una doble ejecución: doble movimiento, doble
cobro, doble evento. Solución proporcional a P2-A, documentada y testeada.

## 14. Dinero

PYG. Montos documentales enteros. Nunca `float`. Preparar tipos/utilidades de dinero
claras. Sin multimoneda. El costeo promedio no se implementa en esta misión.

## 15. Tiempo

Diferenciar explícitamente `occurredAt` (fecha del hecho) y `recordedAt` (fecha de
registro). Elegir y documentar una estrategia coherente de timezone para persistencia;
la presentación será paraguaya. Ninguna lógica de negocio debe depender
accidentalmente del timezone del servidor.

## 16. Validación

Toda entrada externa se valida antes de entrar al dominio. No confiar en forms ni
requests. Errores claros. No inventar validaciones comerciales que el brief no
establezca.

## 17. Testing de esta misión

- **Negocio**: se crea correctamente; el saldo inicial admite montos PYG enteros
  válidos; los datos de otro negocio permanecen aislados.
- **Usuario/acceso**: el dueño pertenece al negocio correcto; el contador pertenece al
  negocio correcto; un acceso revocado queda distinguible de uno activo.
- **Fechas**: fecha del hecho y fecha de registro son campos independientes.
- **Libro de Hechos**: registrar un evento; relacionarlo con una entidad; relacionarlo
  con varias; consultar historial contextual por entidad; consultar actividad reciente
  del negocio; el mismo evento aparece desde distintos contextos sin duplicarse; actor
  y origen permanecen trazables.
- **Atomicidad**: una transacción fallida no deja estado parcial.
- **Aislamiento**: un negocio no puede recuperar eventos de otro.
- **Dinero**: las utilidades PYG no aceptan montos fraccionarios donde el dominio
  requiere enteros.

## 18-19. Documentación y README

Incluir `CLAUDE.md`, el Master Plan, el Implementation Brief, los documentos dueños
reconciliados necesarios y un README técnico. El README explica qué es ARKAN Control,
estado actual, cómo ejecutar, cómo correr tests, estructura principal, fuentes de
verdad, qué slice está implementado y qué no lo está. El README no es otro Master Plan.

## 20. Prohibido en esta misión

Catálogo completo, venta, inventario comercial completo, compras, cobros, gastos,
devoluciones, merma comercial, Posición registrada, dashboard completo, Asuntos,
Business Health, evidencias, contador UI, P2-B, calendario, bancos, integración
externa, SIFEN, DNIT, facturación fiscal, IA, predicciones, pricing y landing. No
adelantar features porque "son fáciles": primero cimientos verdes.

## 21. Principios de implementación

Prioridad: correctitud, integridad, trazabilidad, simplicidad arquitectónica,
testabilidad, velocidad de desarrollo, estética técnica. Ni arquitectura enterprise
para un piloto, ni deuda obvia por avanzar rápido.

## 22. Definition of Done

Existe `arkan-control`; instala; ejecuta localmente; base de datos y migraciones
funcionan; el modelo Negocio funciona; el modelo Usuario/Acceso mínimo funciona; el
aislamiento por negocio está establecido; las convenciones transversales están
establecidas; el Libro de Hechos está implementado; un evento puede relacionarse
contextualmente con múltiples entidades sin duplicación; las consultas de
actividad/historial funcionan; la atomicidad está demostrada; los tests pasan;
lint/typecheck pasan; README actualizado; ningún feature fuera de scope; worktree
limpio.

## 23. Control de cambios

Cambios pequeños y comprensibles: verificar contexto, implementar, testear. Sin
refactors masivos innecesarios. Commits pequeños y semánticos; no mezclar
documentación, infraestructura y feature enorme en un solo commit cuando pueda
separarse razonablemente.

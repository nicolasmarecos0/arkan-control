# ARKAN_CONTROL_MASTER_PLAN_v1.0

**Estado:** documento central consolidado — v1.0 (segunda consolidación aplicada)
**Producto:** ARKAN Control (ARKAN Growth)
**Alcance de validación:** Prototype 2 — tienda de ropa / indumentaria
**Fuentes:** `CLAUDE.md`, `ARKAN_PROJECT_STATE.md`, `ARKAN_INDEX.md`, `ARKAN_VISION.md`, `ARKAN_CONTROL_PRODUCT.md`, `ARKAN_DESIGN_SYSTEM.md`, `ARKAN_DATA_CONNECTIONS.md`, `ARKAN_INHERITANCE_MAP.md`, `ARKAN_LANDING_BRIEF.md`, `ARKAN_RECOVERY_AUDIT.md` (F1–F26), auditoría diferencial, y las decisiones finales de consolidación.

---

## 0. Cómo leer este documento

### 0.1 Propósito

Este documento existe para que, a partir de acá, **nadie tenga que inventar una decisión estructural**.

Sirve para tres cosas:

1. derivar los documentos dueños definitivos (`ARKAN_INDEX.md` sigue siendo el mapa);
2. justificar la creación del repositorio `arkan-control`;
3. permitir que una implementación posterior de P2 se ejecute sin decidir por su cuenta reglas de dominio, alcance ni experiencia.

Este documento **no es código, no es esquema de base de datos, no es especificación de UI pixel a pixel**. Es la fuente de verdad conceptual y de reglas.

### 0.2 Tipos de afirmación

Cada afirmación relevante está etiquetada:

| Etiqueta | Significado | ¿Se puede implementar? |
|---|---|---|
| `[DECISIÓN]` | Cerrado. No se reabre sin decisión explícita registrada. | Sí, si pertenece al alcance de P2. |
| `[HIPÓTESIS]` | Creemos que es así, falta evidencia real. | No como requisito. Se valida en piloto. |
| `[PROPUESTA]` | Recomendación de este documento que todavía **no fue aprobada**. Requiere sí/no del dueño del producto. | No hasta aprobarse. |
| `[FUTURO]` | Dirección conocida, fuera del alcance actual. | No. |
| `[CONFLICTO]` | Contradicción detectada entre documentos o entre decisiones. Se señala, **no se resuelve silenciosamente**. | No hasta resolverse. |

Regla dura de lectura: **si algo no está etiquetado como `[DECISIÓN]`, no es requisito de Prototype 2.**

### 0.3 Identificadores

Las decisiones cerradas durante esta consolidación llevan ID `MP-xxx` y están listadas en la sección 13. Los conflictos llevan ID `CF-xx`. Las preguntas abiertas llevan `Q-xx`. Las hipótesis de piloto llevan `H-xx`.

### 0.4 Precedencia documental

`[DECISIÓN]` En caso de discrepancia entre este Master Plan y un documento anterior:

1. este Master Plan tiene precedencia **conceptual**;
2. pero la corrección debe bajarse al documento dueño correspondiente antes de considerarse aplicada;
3. ningún cambio en ARKAN modifica Gestio.

`[DECISIÓN]` Este documento no reemplaza a `CLAUDE.md`. `CLAUDE.md` sigue siendo las reglas de operación de sesión.

---

## 1. Qué es ARKAN Control

### 1.1 Definición

`[DECISIÓN]` ARKAN Control es el producto de gestión e inteligencia empresarial de ARKAN Growth. Su objetivo es que el dueño de un negocio pequeño sepa **qué está pasando, por qué importa y qué puede hacer ahora**.

`[DECISIÓN]` ARKAN Control no es un sistema de registro. El registro es el medio; la comprensión es el producto.

### 1.2 Qué no es

`[DECISIÓN]` ARKAN Control **no es**:

- un ERP;
- un sistema contable;
- un POS pesado ni un sistema de cajero complejo;
- un facturador fiscal;
- un CRM;
- una plataforma de desarrollo a medida por cliente.

### 1.3 Relación con Gestio

`[DECISIÓN]` ARKAN Control es un producto independiente. Gestio permanece intacto, separado y protegido.

`[DECISIÓN]` No se transfiere infraestructura fiscal: SIFEN, DNIT, timbrado, firma digital, certificados, CSC, KuDE como responsabilidad de emisión, XML fiscal, Notas Técnicas, PSC, transmisión, consultas regulatorias, roadmap fiscal ni pricing construido alrededor del compliance.

`[DECISIÓN]` Sí se hereda: tesis de producto, patrones UX útiles, calidad visual, y el principio de que *una operación actualiza automáticamente las áreas relacionadas*.

`[DECISIÓN]` Ningún cambio en ARKAN modifica Gestio automáticamente.

### 1.4 Lugar en el ecosistema

`[DECISIÓN]` ARKAN Growth: **ARKAN Reviews** (reputación), **ARKAN Control** (entender y controlar), **ARKAN BioSite** (presencia digital), **ARKAN Business Discovery** `[FUTURO]`.

`[DECISIÓN]` ARKAN Control es la pieza donde se acumula comprensión del negocio.

---

## 2. Tesis y doctrina

Las doctrinas se numeran `D1..D19` para poder citarlas desde decisiones de diseño e implementación. Todas son `[DECISIÓN]` salvo indicación contraria.

### D1 — Filosofía rectora

> Mejorar y agilizar el negocio. Crecer juntos. Cliente crece, ARKAN crece.

Toda propuesta debe pasar dos preguntas: ¿mejora realmente el negocio del cliente? ¿permite que ARKAN crezca con él? Si no pasa ambas, no entra aunque sea técnicamente interesante.

### D2 — Cadena de valor del producto

Gestión → Datos → Información → Inteligencia → Alertas → Explicación → Recomendaciones → Acciones → Seguimiento → Mejora → Crecimiento.

Movimiento del dueño: *"No sé qué está pasando"* → *"Entiendo qué está pasando"* → *"Sé qué puedo hacer ahora"*.

### D3 — Obsesión: claridad

Claridad = comprender el estado real del negocio sin tener que interpretar información compleja.

### D4 — La complejidad existe detrás de ARKAN, nunca delante del usuario

Principio maestro. Prorrateo de descuentos, propagación de efectos, costeo, derivaciones: todo eso vive atrás.

### D5 — Simplicidad operativa

`[DECISIÓN]` Registrar una operación diaria debe ser extremadamente simple. El usuario introduce la mínima información necesaria; ARKAN propaga las consecuencias.

> Una venta debe sentirse como registrar una venta, no como completar un formulario administrativo.

### D6 — Carga con valor inmediato

`[DECISIÓN]` **Cada dato registrado debe producir una consecuencia visible y comprensible siempre que exista una consecuencia empresarial real.**

La satisfacción viene de ver cómo el negocio adquiere claridad, no de recompensas del software.

> No estoy alimentando software. Estoy conectando ARKAN con mi negocio.

`[DECISIÓN]` Corolario: si un dato **no** tiene consecuencia empresarial real, no se le fabrica una consecuencia visible para simular valor.

### D7 — Registro ≠ engagement

No se premia al usuario por usar ARKAN. Se hace visible el progreso que ocurre en su empresa. Nada de medallas, puntos, rachas ni recompensas artificiales.

### D8 — Living Business

El negocio debe sentirse vivo dentro de ARKAN. Una venta cambia algo. Un cobro cambia algo. Resolver un problema cambia algo.

> ARKAN no simula que el negocio está vivo. Hace visible la actividad real que ya existe.

Patrón: **Estado → Cambio → Acción.**

### D9 — Un hecho se registra una sola vez

El usuario registra un hecho una vez; el resto del sistema se actualiza por conexión, no por doble carga.

### D10 — Trazabilidad total

Toda cifra derivada debe poder responder *¿de qué datos sale?*. Todo movimiento importante debe poder responder: qué ocurrió, cuándo, quién, desde dónde, qué cambió. Una corrección nunca borra la historia silenciosamente.

### D11 — No hay salud sin evidencia. No hay estado sin explicación.

No hay certeza mayor que la evidencia disponible. La inteligencia es proporcional a la evidencia.

### D12 — Attention Must Be Earned

Cada interrupción gasta atención del dueño. **El silencio es el estado normal.** Una alerta debe justificar una decisión o una acción.

### D13 — Gravedad real

La gravedad visual debe representar gravedad empresarial real. Rojo jamás para vender un plan superior. Nada de urgencia artificial.

### D14 — La IA aconseja; el dueño decide

La inteligencia aumenta capacidad humana; no la reemplaza. Debe diferenciar evidencia, interpretación y posibilidad, y reconocer cuando carece de información.

### D15 — Compounding Understanding

La retención viene de valor acumulado, no de lock-in. Cuanto más historial coherente tiene ARKAN, mejor puede contextualizar el negocio.

### D16 — Herramientas en contexto

La herramienta debe aparecer donde ocurre la decisión, no en un menú lejano.

### D17 — Connection First

`[DECISIÓN]` **Las conexiones entre los hechos del negocio son una de las ventajas centrales de ARKAN Control.**

ARKAN puede ser complejo internamente porque su trabajo es conectar automáticamente información que normalmente el dueño tendría dispersa.

Un hecho importante debe propagarse automáticamente hacia **todas** las áreas que realmente afecta:

```
Venta
 → producto/variante
 → inventario
 → cliente
 → cobro
 → método de pago
 → Posición registrada
 → evidencia/comprobante cuando exista
 → factura externa cuando exista
 → métricas
 → Business Health cuando haya cobertura
 → historial
 → Asuntos cuando corresponda
```

> **El dueño hace una cosa. ARKAN conecta todo lo demás que corresponda.**

`[DECISIÓN]` D17 **amplía D9, no lo reemplaza.** D9 dice que el hecho se registra una sola vez; D17 dice que la propagación es completa y es la ventaja competitiva, no un efecto secundario.

`[DECISIÓN]` Límites de D17:

- **no crear conexiones artificiales sólo para aparentar integración**;
- toda conexión debe representar una **consecuencia empresarial real**;
- toda conexión conserva **origen y trazabilidad** (D10).

### D18 — Complejidad interna ≠ complejidad de interfaz

`[DECISIÓN]` **La cantidad de entidades y conexiones internas nunca determina la cantidad de pantallas, módulos ni pasos que ve el usuario.**

ARKAN puede tener un dominio complejo por detrás. Por delante debe mantenerse extremadamente simple.

`[DECISIÓN]` **No convertir cada entidad del modelo en una opción de navegación.** El objetivo explícito es evitar que ARKAN se convierta visualmente en un ERP.

`[DECISIÓN]` La arquitectura de navegación se resuelve **posteriormente y bajo esta restricción**. D18 es una restricción de diseño, no una sugerencia.

D18 es el complemento necesario de D17: si la potencia viene de conectar muchas cosas, la disciplina tiene que venir de no mostrarlas todas.

### D19 — Fast Capture

`[DECISIÓN]` Registrar operaciones frecuentes debe ser **extremadamente rápido**. La velocidad de captura es un objetivo de producto, no una optimización posterior.

`[DECISIÓN]` Flujo ideal de venta: **producto/variante → cantidad → medio/estado de pago → confirmar.**

- el cliente aparece **solamente cuando corresponde**;
- los descuentos aparecen **solamente cuando se usan**;
- la información adicional es **progresiva**, nunca obligatoria sin necesidad empresarial.

`[DECISIÓN]` **Criterio de esfuerzo mínimo:**

> **ARKAN busca el menor esfuerzo razonablemente posible para registrar un hecho correctamente.**

Regla operativa de aplicación:

- **si podemos eliminar un paso sin perder una consecuencia empresarial necesaria, lo eliminamos**;
- **no sacrificar integridad del dato solamente para ganar velocidad**;
- **tampoco pedir información "por las dudas"**;
- la complejidad permanece detrás (D4).

`[HIPÓTESIS]` H-09 — El flujo habitual de venta de ARKAN puede ser significativamente más simple y rápido que el método actual del negocio, hasta sentirse inmediato y natural una vez configurado el catálogo.

`[DECISIÓN]` **No existe ningún umbral temporal decidido.** ARKAN no se diseña alrededor de un número de segundos. La velocidad es un objetivo de producto y una hipótesis a validar; **el nivel de velocidad razonable lo determinarán los datos del piloto**, no una cifra fijada de antemano.

`[DECISIÓN]` La comparación relevante no es contra un reloj abstracto sino **contra el proceso que el negocio usaba antes de ARKAN**.

### 2.1 Analogía conceptual

`[DECISIÓN]` "TradeZella para empresas" es analogía **interna**: registrar actividad, convertirla en métricas, detectar patrones, mejorar decisiones. No es referencia de UI, no es promesa de marketing, y no se usa en materiales públicos.

### 2.2 El tiempo como resultado

`[DECISIÓN]` El sistema tiene éxito cuando el dueño necesita **menos tiempo** para comprender **mejor** su negocio.

`[DECISIÓN]` Mecanismo explícito:

> **ARKAN devuelve tiempo al dueño al eliminar carga duplicada, conectar automáticamente las consecuencias y acelerar la comprensión del negocio.**

Los tres verbos importan: *eliminar* (D9), *conectar* (D17), *acelerar* (D3, D19).

`[DECISIÓN]` El tiempo ganado es **criterio interno de éxito** del producto.

`[DECISIÓN]` **No convertirlo todavía en promesa cuantificada de marketing** hasta medirlo en negocios reales. Esto aplica igual a la velocidad de captura de D19: se mide primero, se promete después — o no se promete. Y no se fija una cifra antes de medir.

---

## 3. Cliente y alcance de validación

### 3.1 Cliente

`[DECISIÓN]` ICP inicial: **tienda de ropa / indumentaria** en Paraguay, negocio pequeño que ya opera y empieza a perder control al crecer.

`[DECISIÓN]` Prototype 2 se valida con **un negocio real** antes de generalizar a otros rubros.

### 3.2 Qué valida el piloto

`[DECISIÓN]` El piloto valida:

1. que registrar la operación diaria en ARKAN sea más simple que lo que el negocio hace hoy;
2. que la propagación automática elimine doble carga real;
3. que el dueño obtenga comprensión que antes no tenía;
4. que las alertas mostradas hayan merecido la interrupción.

### 3.3 Qué NO valida

`[DECISIÓN]` El piloto no valida pricing, no valida Business Health como fórmula, no valida multi-rubro y no valida capacidades de inteligencia avanzada.

### 3.4 Hipótesis de rubro

`[HIPÓTESIS]` H-01 — Una necesidad importante del comercio de indumentaria es **responder rápidamente disponibilidad real por talle/color**. Requiere validación de campo.

---

## 4. Modelo de dominio

> Esta sección es la que evita que la implementación invente reglas. Todo lo que acá sea `[PROPUESTA]` o `[CONFLICTO]` **debe resolverse antes de codificar la parte afectada**.

### 4.1 Convenciones transversales

`[DECISIÓN]` Toda entidad operativa conserva: identificador, negocio al que pertenece, fecha/hora del hecho, fecha/hora de registro, **actor** (quién), **origen** (desde dónde/qué flujo la creó) y estado.

`[DECISIÓN]` Fecha del hecho ≠ fecha de registro. Las métricas de período usan **fecha del hecho**.

`[DECISIÓN]` Nada se borra físicamente. Las correcciones son eventos nuevos.

`[PROPUESTA]` Moneda única en P2: guaraníes, montos enteros, sin decimales. Multi-moneda y conversión quedan `[FUTURO]`. → Q-01.

`[DECISIÓN]` Un solo negocio por cuenta en P2. Multi-sucursal y multi-depósito: `[FUTURO]`.

`[DECISIÓN]` Arquitectura preparada para más de un usuario desde el inicio, aunque la interfaz de P2 se centre en dueño + contador.

### 4.2 Entidades núcleo de P2

| Entidad | Alcance | Nota |
|---|---|---|
| Negocio | P2-A | datos del negocio, saldo inicial declarado |
| Usuario / Acceso | P2-A | dueño, contador |
| Categoría | P2-A | simple, plana |
| Producto | P2-A | nombre, SKU base, categoría, estado activo/inactivo |
| Variante | P2-A | **talle + color**, SKU propio, costo, precio, stock mínimo |
| Cliente | P2-A | datos básicos, historial, saldo |
| Venta + Línea de venta | P2-A | operación central |
| Movimiento de inventario | P2-A | toda variación de stock |
| Cobro | P2-A | pago de una venta, total o parcial |
| Gasto | P2-A | fecha, categoría, monto, descripción |
| Compra + Línea de compra | P2-A | entrada de mercadería |
| Pago de compra | P2-A | evento independiente |
| Corrección de venta (devolución / anulación) | P2-A | evento correctivo |
| Merma | P2-A | unidad perdida |
| Aporte / Retiro del dueño | P2-A | movimiento no comercial |
| Movimiento de Posición registrada | P2-A | derivado, con método de pago |
| Asunto | P2-A (básico) | objeto transversal de atención |
| Evento de historial / auditoría | P2-A | traza |
| Comprobante / evidencia | **P2-A** | adjunto o referencia vinculada desde la operación |
| Banco / Cuenta | P2-B | identificación simple |
| Centro de Bancos y Comprobantes | P2-B | organización, búsqueda, filtros, archivo |
| Evento de calendario | P2-B | Calendar Lite |

`[DECISIÓN]` La **entidad** Comprobante existe desde P2-A porque una venta o un cobro debe poder llevar su evidencia adjunta. Lo que llega en P2-B es el **centro organizado** (bancos, cuentas, búsqueda, filtros, archivo, documentos pendientes), no la capacidad de adjuntar. Ver 4.16.

### 4.3 Producto, variante y catálogo

`[DECISIÓN]` Catálogo + variantes es la columna vertebral del modelo.

`[DECISIÓN]` La **variante** (talle + color) es la unidad que tiene stock, costo y precio. El producto agrupa.

`[DECISIÓN]` Campos mínimos para dar de alta: nombre, categoría, precio, y al menos una variante. Todo lo demás es profundidad opcional.

`[DECISIÓN]` Carga rápida y carga masiva son requisito de P2 (el ICP tiene catálogos grandes por combinación talle/color).

`[PROPUESTA]` Generación asistida de matriz talles × colores al crear un producto, para no obligar a cargar variante por variante. → Q-02.

`[DECISIÓN]` Estado activo/inactivo. Inactivar nunca borra historial ni movimientos.

### 4.4 Venta

`[DECISIÓN]` Flujo mínimo (D19): **producto/variante → cantidad → medio/estado de pago → confirmar.** El cliente y los descuentos aparecen sólo cuando corresponde; nada adicional es obligatorio sin necesidad empresarial.

`[DECISIÓN]` Estados de cobro de la venta: **pagada**, **parcial**, **pendiente**.

`[DECISIÓN]` Cliente es opcional, **salvo** que la venta quede pendiente o parcial: en ese caso el cliente es obligatorio, porque sin cliente no existe cuenta por cobrar atribuible.

`[DECISIÓN]` Descuentos: se permite **descuento por línea** y **descuento global de la venta**. Cuando existe descuento global, ARKAN lo **prorratea internamente sobre las líneas** para conservar margen explicable por producto. El usuario no ve el prorrateo (D4).

`[DECISIÓN]` Cada línea de venta **congela el costo unitario vigente al momento de la venta** (`costo_al_momento`, snapshot). Los cambios posteriores de costo **nunca modifican margen histórico**. Ver 4.10.

`[DECISIÓN]` Referencia o copia de factura externa: campo opcional (número/referencia y/o archivo). ARKAN documenta una venta; **no emite, no firma, no transmite**.

`[DECISIÓN]` **Evidencia conectada sin frenar la operación.** Desde la venta (y desde el cobro) se puede vincular evidencia básica — comprobante de transferencia, referencia o copia de factura externa — pero **la evidencia nunca bloquea la finalización de una venta normal**.

Puede agregarse:

- durante la venta;
- inmediatamente después;
- posteriormente.

`[DECISIÓN]` Si queda pendiente, la documentación faltante puede aparecer como *pendiente de vincular* según las reglas de atención (D12, 4.17). Nunca como bloqueo.

`[DECISIÓN]` Al confirmar, la venta dispara la propagación completa descrita en la sección 5.

`[PROPUESTA]` No permitir stock negativo por defecto; ofrecer advertencia explícita y permitir continuar dejando registro del faltante. → Q-04.

### 4.5 Ventas brutas, correcciones y ventas netas

`[DECISIÓN]` **Ventas brutas** = operaciones de venta realizadas en el período. Información operativa visible.

`[DECISIÓN]` **Correcciones** = devoluciones y anulaciones comerciales. Se muestran como eventos correctivos **del período en el que ocurren**, no se retroaplican al período original.

`[DECISIÓN]` **Ventas netas** = ventas brutas − devoluciones/correcciones económicas correspondientes.

`[DECISIÓN]` **Business Health y los comparativos usan ventas netas.**

`[DECISIÓN]` La interfaz debe permitir comprender los tres valores: cuánto se vendió, cuánto fue corregido/devuelto, cuánto quedó como venta neta. **No ocultar ninguno de los tres.**

`[DECISIÓN]` Las ventas anuladas por `ERROR_DE_CARGA` quedan **fuera de brutas y de netas** (ver 4.7).

### 4.6 Devolución / corrección

`[DECISIÓN]` Prototype 2 **no incorpora saldo a favor del cliente**. No existe crédito interno.

`[DECISIÓN]` Resolución económica de una devolución:

| Situación de la venta | Efecto |
|---|---|
| Venta pagada | reembolso real |
| Venta pendiente | reduce el saldo pendiente |
| Venta parcialmente pagada | primero reduce el saldo pendiente; si queda excedente ya cobrado, corresponde reembolso |

`[DECISIÓN]` Efecto sobre inventario:

- devolución **vendible** → la unidad reingresa al stock comercial **al costo snapshot de la línea de venta original**, no al costo vigente actual;
- devolución **no vendible** → se convierte en **merma** (4.8) y no reingresa.

`[DECISIÓN]` El reingreso al costo snapshot recalcula el promedio ponderado móvil de la variante incluyendo esa unidad. Es deliberado: la unidad vuelve con el costo con el que salió, no con uno inventado.

`[PROPUESTA]` La devolución exige indicar si la unidad es vendible o no vendible, y admite motivo. → Q-05 (¿motivo obligatorio o sugerido?).

`[DECISIÓN]` La devolución es siempre un evento nuevo y trazable, vinculado a la venta original.

### 4.7 Anulación por error de carga

`[DECISIÓN]` Existe una corrección administrativa especial: **`ERROR_DE_CARGA`**.

Sólo puede utilizarse cuando se cumplen **todas** estas condiciones:

- ocurre el **mismo día** de la venta;
- **no existe cobro asociado**;
- **no existe devolución**;
- **no existen eventos posteriores dependientes**;
- **exige motivo**.

`[DECISIÓN]` Efectos:

- la operación **permanece visible en historial/auditoría**;
- queda **excluida de métricas empresariales** porque no representa un hecho comercial real;
- revierte el movimiento de inventario que había generado;
- no genera evento correctivo económico (no es una devolución).

`[DECISIÓN]` Esto **no equivale a borrar historia**. La historia registra: *venta creada por error → anulada por error de carga*.

`[DECISIÓN]` Si alguna condición no se cumple, la corrección debe tramitarse como devolución/corrección comercial (4.6), no como error de carga.

### 4.8 Merma

`[DECISIÓN]` Una devolución no vendible puede convertirse en merma. Reglas:

- no reingresa al stock comercial;
- **no vuelve a descontar stock**, porque la venta original ya lo descontó;
- la corrección **revierte el ingreso** correspondiente;
- **NO revierte artificialmente el costo consumido**;
- permanece como evento trazable.

`[DECISIÓN]` La empresa perdió la venta y la unidad. ARKAN no oculta esa pérdida mediante contabilidad artificial.

`[PROPUESTA]` La merma también puede originarse fuera de una devolución (rotura, pérdida, robo) como tipo de ajuste de inventario con motivo. → Q-06.

### 4.9 Inventario

`[DECISIÓN]` El stock **se deriva de movimientos**; no se mantiene por carga duplicada.

`[DECISIÓN]` Tipos de movimiento en P2: entrada por compra, salida por venta, reingreso por devolución vendible, ajuste manual (con motivo obligatorio), merma, reversión por error de carga.

`[DECISIÓN]` Stock mínimo lo declara el usuario, por variante.

`[DECISIÓN]` Historial de movimientos por variante, con actor, fecha, motivo y origen.

`[FUTURO]` Rotación, días de cobertura, valorización, stock inmovilizado, reposición sugerida, anomalías, relación inventario/rentabilidad, estacionalidad.

### 4.10 Costo y margen — **RESUELTO**

> **CF-01 / Q-03: CERRADO.** Antes era la única decisión estructural bloqueante del modelo. Ya no lo es.

`[DECISIÓN]` Prototype 2 utiliza **costo promedio ponderado móvil** para calcular el costo vigente de una variante.

`[DECISIÓN]` Cada línea de venta conserva un **snapshot del costo vigente al momento de la venta**.

`[DECISIÓN]` **Los cambios posteriores de costo nunca modifican margen histórico.** Una compra nueva a otro precio mueve el costo vigente hacia adelante; no reescribe el pasado.

`[DECISIÓN]` Reglas asociadas:

- **costo ausente ≠ G. 0**;
- si falta costo, el **margen es información insuficiente**, nunca 0% ni 100%;
- una **devolución vendible reingresa al costo snapshot** de la línea original (4.6);
- una **merma no revierte el costo consumido** (4.8);
- el cálculo debe ser **explicable hasta sus entradas originales**: qué compras formaron el promedio, en qué orden, y con qué costo salió cada venta.

`[DECISIÓN]` Descartados explícitamente: **último costo** (distorsiona margen histórico) y **FIFO por lote** (exige gestión de lotes y viola D5 en la carga diaria).

### 4.11 Cobros

`[DECISIÓN]` Una venta pendiente o parcial genera saldo del cliente.

`[DECISIÓN]` Cobros posteriores y **cobros parciales** son requisito de P2.

`[DECISIÓN]` Cada cobro conserva fecha, monto, método de pago, actor y vínculo a la venta y al cliente.

`[DECISIÓN]` Un cobro atrasado relevante puede generar un Asunto de clase ATENCIÓN o CRÍTICO según evidencia e impacto — nunca por antigüedad sola sin importe relevante.

`[PROPUESTA]` Vencimiento opcional por venta pendiente; si no se declara, el atraso se mide desde la fecha de la venta. → Q-07.

`[FUTURO]` Recordatorios inteligentes, gestión de cobranza asistida.

### 4.12 Compras y pago a proveedores

`[DECISIÓN]` La compra puede estar **PENDIENTE** o **PAGADA**.

`[DECISIÓN]` El pago de una compra es un **evento independiente** con fecha, monto y método.

`[DECISIÓN]` Prototype 2 **no soporta pagos parciales a proveedores**.

`[DECISIÓN]` P2 **no construye** una entidad compleja de proveedor ni cuentas por pagar.

`[DECISIÓN]` Efectos:

- la compra afecta **inventario**;
- el pago afecta **Posición registrada**;
- el **costo de mercadería vendida** afecta resultado/margen (no la compra en sí).

`[PROPUESTA]` El proveedor se registra en P2 como **texto libre en la compra**, no como entidad. → Q-08.

### 4.13 Gastos

`[DECISIÓN]` Campos: fecha, categoría, monto, descripción. Registro simple.

`[DECISIÓN]` El gasto afecta Posición registrada y contexto financiero; alimenta *presión de gastos* cuando exista cobertura suficiente.

`[FUTURO]` Gasto recurrente, presupuesto por categoría.

### 4.14 Aporte y retiro del dueño

`[DECISIÓN]` Existen movimientos **`APORTE_DUENO`** y **`RETIRO_DUENO`**.

`[DECISIÓN]` Afectan **Posición registrada**.

`[DECISIÓN]` **NO** son ingreso comercial, gasto operativo, venta ni compra.

`[DECISIÓN]` **Nunca** deben afectar directamente Business Health como presión de gastos ni como crecimiento de ingresos.

`[DECISIÓN]` Son visibles y trazables: el dueño debe poder ver cuánto puso y cuánto sacó, separado del resultado del negocio.

### 4.15 Posición registrada

`[DECISIÓN]` **No se llama Caja.** El nombre conceptual y de producto es **Posición registrada**.

`[DECISIÓN]` Definición:

```
saldo inicial declarado
+ entradas registradas
− salidas registradas
= Posición registrada
```

`[DECISIÓN]` Es una **vista derivada**. No implica arqueo físico, conciliación bancaria, saldo bancario real ni liquidez garantizada.

`[DECISIÓN]` Cada movimiento conserva **método de pago**.

`[DECISIÓN]` La interfaz debe declarar explícitamente su limitación: *esto es lo que registraste, no necesariamente lo que tenés*.

`[CONFLICTO]` **CF-02.** `ARKAN_DATA_CONNECTIONS.md`, `ARKAN_CONTROL_PRODUCT.md` y `ARKAN_RECOVERY_AUDIT.md` usan el término **Caja**. Debe reemplazarse por **Posición registrada** en los documentos dueños. Hasta que se haga, coexisten dos nombres para el mismo concepto.

`[PROPUESTA]` Entradas: cobro de venta al contado, cobro posterior, aporte del dueño. Salidas: gasto, pago de compra, reembolso por devolución, retiro del dueño. → Q-09 (confirmar que la lista es cerrada en P2).

### 4.16 Evidencia, bancos y comprobantes

`[DECISIÓN]` La capacidad se divide en dos etapas:

| | P2-A | P2-B |
|---|---|---|
| **Qué** | adjuntar/vincular evidencia **desde la operación** | **centro organizado** de Bancos y Comprobantes |
| **Incluye** | comprobante de transferencia, referencia/copia de factura externa, vínculo a la operación, estado *pendiente de vincular* | bancos, cuentas, búsqueda, filtros, archivo de comprobantes, documentos pendientes |
| **Regla** | nunca bloquea la operación (4.4) | organización, no operación |

`[DECISIÓN]` Motivo de la división: la evidencia **nace en el momento de la operación**; el archivo organizado es una necesidad posterior. Adjuntar desde la venta en P2-A es lo que hace que la evidencia quede conectada (D17); postergarlo entero a P2-B produciría una pila de documentos huérfanos.

`[DECISIÓN]` El **centro organizado** se incorpora en P2-B como capacidad simple de organización. Objetivo: centralizar y organizar evidencia/documentos bancarios relacionados con las operaciones del negocio.

`[DECISIÓN]` Puede registrar bancos/cuentas con identificación simple: banco, nombre/alias de cuenta, información mínima útil.

`[DECISIÓN]` **No almacenar credenciales bancarias.**

`[DECISIÓN]` Un **comprobante** puede almacenar: archivo/imagen/PDF, fecha, monto, banco/cuenta cuando corresponda, descripción/notas, tipo documental y vínculo opcional con una operación ARKAN.

`[DECISIÓN]` Puede vincularse a: cobro, venta, compra, gasto, aporte, retiro, devolución/reembolso.

`[DECISIÓN]` **Regla fundamental: EL COMPROBANTE ES EVIDENCIA. NO ES UNA SEGUNDA OPERACIÓN.** Si un cobro ya está registrado y se adjunta un comprobante, no se crea otro ingreso.

`[DECISIÓN]` Un comprobante cargado sin operación relacionada queda en estado **Pendiente de vincular** y **no afecta** métricas, Posición registrada ni Business Health.

`[DECISIÓN]` P2 **no incluye**: integración bancaria automática, lectura automática de movimientos, open banking, conciliación, transferencias desde ARKAN, credenciales ni conexión directa con bancos. Todo eso es `[FUTURO]`.

`[PROPUESTA]` Un comprobante *Pendiente de vincular* puede generar un Asunto de clase ATENCIÓN sólo si supera cierta antigüedad o volumen; por defecto es una lista pasiva, no una interrupción (D12). → Q-10.

### 4.17 Asunto

`[DECISIÓN]` Existe un **único objeto transversal** llamado **Asunto**. Reemplaza tareas artificiales y gamificación.

`[DECISIÓN]` Clases: **PROGRESO**, **OPORTUNIDAD**, **ATENCIÓN**, **CRÍTICO**.

`[DECISIÓN]` La clase determina el **derecho a interrumpir**:

| Clase | Derecho a interrumpir |
|---|---|
| PROGRESO | Nunca interrumpe. |
| OPORTUNIDAD | Aparece de forma pasiva o bajo presupuesto de atención. |
| ATENCIÓN | Puede interrumpir cuando justifica una decisión. |
| CRÍTICO | Puede interrumpir con prioridad **únicamente** cuando existe gravedad empresarial real demostrable. |

`[DECISIÓN]` **La recomendación es un campo del Asunto, no otra entidad.**

`[DECISIÓN]` Estructura conceptual de un Asunto: clase, detección (qué se detectó), evidencia (de qué datos sale), explicación (por qué importa), recomendación (opcional), estado (abierto / en seguimiento / resuelto / descartado), y seguimiento (qué evidencia nueva lo cierra).

`[DECISIÓN]` Los Asuntos nacen de la realidad del negocio: stock bajo, cobro vencido, información faltante, diferencia que requiere revisión, situación importante sin resolver.

`[DECISIÓN]` **No se crean Asuntos para aumentar engagement.**

`[DECISIÓN]` Un Asunto se cierra cuando la evidencia cambia, no cuando el usuario aprieta un botón de "listo" sin respaldo. Cuando el cierre depende de un acto humano no observable, el usuario puede marcarlo, y eso también queda trazado.

`[CONFLICTO]` **CF-03.** `ARKAN_PROJECT_STATE.md` y `ARKAN_CONTROL_PRODUCT.md` nombran el módulo 8 como *Pendientes / Inteligencia*. La entidad ahora se llama **Asunto**. Debe definirse si el módulo pasa a llamarse *Asuntos* o si *Pendientes* queda como nombre de pantalla y *Asunto* como nombre del objeto. → Q-11.

### 4.18 Calendario — P2-B (Calendar Lite)

`[DECISIÓN]` En P2-B el calendario contiene **sólo eventos creados/configurados explícitamente por la empresa**: nueva colección, campaña, promoción, evento interno, fecha propia.

`[DECISIÓN]` **No** genera fechas comerciales automáticas ni sugerencias en P2.

`[FUTURO]` Calendario Inteligente: fechas comerciales relevantes, estacionalidad, historial, ventas anteriores, inventario, recomendaciones de preparación. Contexto temporal del negocio, no agenda aislada.

`[DECISIÓN]` No generar spam de fechas genéricas, nunca.

### 4.19 Historial y auditoría

`[DECISIÓN]` Todo movimiento importante es auditable y responde: qué ocurrió, cuándo, quién, desde dónde/origen, qué cambió.

`[DECISIÓN]` Corrección no borra historia. La secuencia queda visible.

`[DECISIÓN]` Toda cifra derivada debe poder abrirse hacia las operaciones que la componen: *este número viene de estas operaciones*.

### 4.20 Business Health

`[DECISIÓN]` **Un único estado general de salud, explicable.**

`[DECISIÓN]` Estados: 🟢 Saludable · 🟡 Atención · 🔴 Crítico · ⚪ Información insuficiente.

`[DECISIÓN]` **Default: ⚪ Información insuficiente.**

`[DECISIÓN]` También importa la dirección: estable / recuperándose / deteriorándose.

`[DECISIÓN]` La **cobertura de datos** forma parte del criterio para habilitar salud. Antes del umbral se muestra un estado en lenguaje neutral orientado a cobertura, del tipo *Todavía no tenemos suficiente información para evaluar esta área*, acompañado de **qué información falta**.

`[DECISIÓN]` El copy de cobertura insuficiente **no debe usar lenguaje de aprendizaje sobre el negocio del usuario**, porque roza la sensación de vigilancia o apropiación de información y entra en tensión con la doctrina de onboarding (6.5). Habla de lo que falta, no de lo que ARKAN está haciendo con los datos.

`[DECISIÓN]` Los comparativos y la salud usan **ventas netas** (4.5).

`[DECISIÓN]` Costo ausente ≠ G. 0. **Nunca producir margen o rentabilidad artificial.**

`[DECISIÓN]` Aporte y retiro del dueño no afectan salud como presión de gastos ni como crecimiento de ingresos.

`[DECISIÓN]` Descartado: número mágico de salud sin cobertura; múltiples scores decorativos.

`[HIPÓTESIS]` H-02 — Dimensiones candidatas que aportan **estado interno** al general: ventas, cobros, inventario, rentabilidad, clientes, operación/contexto.

`[CONFLICTO]` **CF-04.** `CLAUDE.md` regla 9 dice *"Nunca scores independientes por módulo"*; `ARKAN_RECOVERY_AUDIT.md` §12 dice que *"cada dimensión puede poseer estado interno que contribuya al general"*. Lectura propuesta, **no aplicada silenciosamente**: los estados por dimensión existen internamente como **causas explicativas**, nunca se publican como puntuaciones independientes ni compiten con el estado global. Requiere confirmación. → Q-12.

`[INCIERTO / HIPÓTESIS]` H-03 — Fórmula, pesos, thresholds y nombre definitivo del indicador. **Permanecen como hipótesis de piloto. No inventar.**

### 4.21 Connection Status

`[DECISIÓN]` **Separación absoluta** entre Business Health y Connection Status.

| | Describe | Estados |
|---|---|---|
| **Business Health** | estado **empresarial** | 🟢 Saludable · 🟡 Atención · 🔴 Crítico · ⚪ Información insuficiente |
| **Connection Status** | estado **técnico / de datos** | 🟢 ARKAN conectado · ○ Sin conexión · Configuración incompleta · Esperando datos |

`[DECISIÓN]` **El rojo pertenece exclusivamente a gravedad empresarial.** Un problema técnico nunca se pinta de rojo empresarial.

`[DECISIÓN]` Esto resuelve el punto que la auditoría había dejado abierto (F4/F-6): ya no se discute si "Internet caído = rojo general". No lo es, por definición.

---

## 5. Mapa de conexiones

> Regla base D9: un hecho se registra una vez y propaga. Todo efecto conserva origen y trazabilidad (D10).

### 5.1 Venta confirmada

```
Venta
 → Inventario ↓ (por variante)
 → Cliente (historial, total comprado, última compra)
 → Cobro o saldo pendiente
 → Posición registrada (si hubo cobro efectivo)
 → Métricas (ventas brutas, netas, margen si hay costo)
 → Business Health / Inteligencia (según cobertura)
 → Asuntos posibles (stock bajo, saldo relevante)
 → Historial / auditoría
```

### 5.2 Cobro posterior

```
Cobro
 → Saldo pendiente de la venta ↓
 → Saldo del cliente ↓
 → Posición registrada ↑
 → Métricas de cobranza
 → Business Health (dimensión cobros)
 → Asunto de cobro vencido: puede resolverse
 → Historial
```

### 5.3 Compra / entrada

```
Compra
 → Inventario ↑
 → Costo de la variante (según método de costeo, ver 4.10)
 → Estado PENDIENTE o PAGADA
 → Historial

Pago de compra
 → Posición registrada ↓
 → Estado de la compra → PAGADA
 → Historial
```

### 5.4 Gasto

```
Gasto
 → Posición registrada ↓
 → Categoría de gasto
 → Contexto financiero / presión de gastos (según cobertura)
 → Historial
```

### 5.5 Ajuste de inventario

```
Ajuste
 → Stock
 → Movimiento con motivo obligatorio
 → Actor responsable
 → Historial / auditoría
 → Asunto potencial si es recurrente
```

### 5.6 Devolución / corrección

```
Devolución
 → Evento correctivo del período actual
 → Ventas netas ↓
 → Si vendible: Inventario ↑
 → Si no vendible: Merma (sin reingreso, sin reversión de costo)
 → Resolución económica según 4.6:
      pagada        → reembolso → Posición registrada ↓
      pendiente     → saldo del cliente ↓
      parcial       → saldo ↓ y, si sobra cobrado, reembolso
 → Cliente (historial)
 → Business Health (usa netas)
 → Historial / auditoría
```

### 5.7 Anulación por error de carga

```
ERROR_DE_CARGA
 → Venta marcada como anulada por error, con motivo
 → Inventario: revierte el movimiento original
 → Métricas: la venta queda EXCLUIDA (ni bruta ni neta)
 → Posición registrada: sin efecto (no había cobro)
 → Historial: visible, permanente
```

### 5.8 Aporte / retiro del dueño

```
APORTE_DUENO   → Posición registrada ↑ → Historial
RETIRO_DUENO   → Posición registrada ↓ → Historial

Ninguno de los dos:
 → NO es ingreso comercial
 → NO es gasto operativo
 → NO afecta presión de gastos ni crecimiento de ingresos en Business Health
```

### 5.9 Comprobante / evidencia — P2-A

`[DECISIÓN]` La vinculación de evidencia desde una operación existe **desde P2-A**. Lo que llega en P2-B es únicamente el **Centro organizado de Bancos y Comprobantes** (bancos, cuentas, búsqueda, filtros, archivo, documentos pendientes). Ver 4.16.

```
Comprobante vinculado
 → Se adjunta como evidencia a una operación existente
 → NO crea operación
 → NO duplica dinero
 → NO altera Posición registrada

Comprobante sin vincular
 → Estado "Pendiente de vincular"
 → NO afecta métricas, Posición ni Business Health
   hasta estar correctamente relacionado con una operación
```

### 5.10 Stock bajo

```
Inventario alcanza el mínimo declarado
 → Asunto clase ATENCIÓN
 → Explicación (qué variante, desde cuándo, ritmo de venta si hay evidencia)
 → Recomendación (campo del Asunto)
 → Seguimiento hasta que entre stock
```

### 5.11 Problema resuelto

```
Acción del dueño
 → Nueva evidencia registrada
 → Asunto pasa a resuelto
 → La alerta desaparece
 → La dimensión afectada se recupera
 → Business Health se actualiza
 → La recuperación es visible: 🔴 → 🟡 → 🟢
```

### 5.12 Contador

```
Invitación → conexión → permisos mínimos → actividad visible → acceso revocable
```

### 5.13 Todo termina en trazabilidad

```
Operación → actor → fecha → origen → consecuencias → métricas
```

---

## 6. Sistema vivo

### 6.1 Estado → Cambio → Acción

`[DECISIÓN]` Cada pantalla relevante puede responder: cuál es el estado, qué cambió, qué se puede hacer.

`[DECISIÓN]` Mostrar qué cambió desde la última visita **cuando sea útil**, no siempre.

### 6.2 Consecuencia visible (D6)

`[DECISIÓN]` Al confirmar una operación, ARKAN muestra de forma breve y comprensible qué se actualizó. Ejemplo conceptual, no copy final:

> Venta registrada. Descontamos 2 unidades de *Remera básica · M · Negro*, actualizamos el historial de *María G.* y quedó un saldo pendiente de G. 120.000.

`[DECISIÓN]` La confirmación explica **consecuencias reales**, no felicita al usuario.

`[DECISIÓN]` **La consecuencia visible de una operación nunca bloquea el siguiente registro.** (Q-13 cerrada.)

Después de confirmar una venta, ARKAN puede mostrar brevemente algo del tipo:

> Venta registrada. Stock actualizado. Cobro actualizado. *N* conexiones actualizadas.

`[DECISIÓN]` El detalle **puede abrirse si el usuario quiere verlo**, pero el flujo queda preparado inmediatamente para continuar trabajando.

`[DECISIÓN]` El feedback debe ser: **inmediato, sutil, comprensible y no bloqueante.**

`[DECISIÓN]` **Prohibido:** pantallas de éxito que obliguen a hacer click para continuar.

`[DECISIÓN]` Esta decisión es la que hace compatibles D6 (consecuencia visible) y D19 (fast capture). Sin ella, mostrar consecuencias destruiría la velocidad.

### 6.3 Living Progress

`[DECISIÓN]` Cuatro formas de progreso: **crecimiento, estabilidad, recuperación, prevención**. Más no siempre significa mejor.

### 6.4 Oportunidades

`[DECISIÓN]` Una oportunidad necesita **evidencia → interpretación → posibilidad**, en ese orden y distinguibles entre sí.

`[DECISIÓN]` Preferimos dos oportunidades importantes a veinte insights irrelevantes.

### 6.5 Onboarding — conectar, no configurar

`[DECISIÓN]` El usuario nunca debe sentir que está configurando un sistema complejo. Debe sentir que **está conectando su negocio**.

`[DECISIÓN]` Progresión conceptual de activación: Empresa → Productos → Inventario → Ventas → Clientes → Cobros → otras conexiones.

`[DECISIÓN]` Metáfora visual aprobada conceptualmente: **conexiones/enchufes que se aproximan y se conectan**. Profesional, no videojuego.

`[DECISIÓN]` Evitar lenguaje de vigilancia o apropiación (*"ya conocemos tu negocio"*). Preferencia recuperada:

> Listo, ya pudimos vincular tu empresa.

`[DECISIÓN]` Dirección conceptual reutilizable: *ARKAN conecta tu negocio con las herramientas que necesita para crecer.*

`[DECISIÓN]` Las conexiones representan fuentes reales de comprensión, no adornos: cada conexión activada debe mostrar **qué valor desbloquea**.

### 6.6 Animación y microinteracción

`[DECISIÓN]` Las animaciones representan **eventos reales**. Nada de movimiento decorativo permanente.

`[DECISIÓN]` Las microinteracciones pueden producir satisfacción, pero deben representar actividad empresarial real (D7).

`[DECISIÓN]` Feedback inmediato, sutil y proporcional.

---

## 7. Experiencia

### 7.1 Identidad UX

`[DECISIÓN]` **Profesional + premium + calmada + viva + rápida + explicable.**

### 7.2 Base visual heredada

`[DECISIÓN]` Lenguaje premium, sobrio y confiable. Base **teal/cyan**. Tipografías **Manrope + Inter**. Radios y sombras coherentes. Aire visual y jerarquía clara. **Español paraguayo / voseo.**

`[DECISIÓN]` La marca se adapta a ARKAN Growth **sin clonar** la identidad de Gestio.

`[DECISIÓN]` Prohibido: apariencia infantil, gamificación superficial, medallas, puntos, rachas.

### 7.3 Principios UX

`[DECISIÓN]`

1. Tranquilidad antes que densidad.
2. Una acción primaria clara por pantalla.
3. La operación básica siempre disponible.
4. La inteligencia aparece cuando existen datos suficientes.
5. Un solo estado global de salud; los módulos aportan causas, no scores propios.
6. Asuntos reales en vez de medallas.
7. Explicar el porqué de una alerta.
8. Mostrar cobertura/limitaciones cuando un análisis no tiene información suficiente.
9. Jerarquía antes que densidad: comprensión de una mirada primero, profundidad después.
10. Cards, indicadores y estados deben **explicar, no decorar**.
11. Ninguna entidad del modelo tiene derecho automático a una entrada de navegación (D18).
12. La velocidad de captura es un requisito de la pantalla, no un extra (D19).

### 7.4 Operar / Entender

`[DECISIÓN]` Son **capas conceptuales**, no dos botones gigantes ni pantallas duplicadas.

- **Operar:** hacer el trabajo — ventas, inventario, clientes, cobros, gastos.
- **Entender:** interpretar — salud, evolución, alertas, oportunidades, patrones.

`[DECISIÓN]` El trabajo operativo no debe quedar sepultado bajo inteligencia. La inteligencia debe estar disponible sin contaminar cada tarea sencilla.

`[DECISIÓN]` Un mismo flujo puede escalar progresivamente en profundidad; no se duplican pantallas.

### 7.5 Formularios

`[DECISIÓN]` Pocos campos esenciales. Profundidad progresiva. Nunca pedir un dato que ARKAN pueda derivar (D9).

### 7.5b Fast Capture

`[DECISIÓN]` La pantalla de venta se diseña **alrededor de la velocidad** (D19), no alrededor de la completitud del modelo.

`[DECISIÓN]` Criterios de diseño:

- el camino por defecto es el más corto posible;
- todo campo opcional está fuera del camino por defecto;
- ningún dato que ARKAN pueda derivar se le pide al usuario (D9);
- la evidencia documental nunca es un paso obligatorio (4.4);
- la confirmación no bloquea (6.2).

`[HIPÓTESIS]` H-09 — El flujo habitual de venta puede ser significativamente más simple y rápido que el método actual del negocio, hasta sentirse inmediato y natural una vez configurado el catálogo. Se valida en piloto.

`[DECISIÓN]` **No hay umbral de segundos.** El criterio de diseño es el esfuerzo mínimo razonable (D19), no un cronómetro.

`[DECISIÓN]` Regla de desempate ante un campo dudoso, en este orden:

1. ¿tiene una consecuencia empresarial real? Si no, **se elimina**;
2. ¿ARKAN puede derivarlo? Si sí, **se deriva** y no se pide;
3. ¿es necesario para la integridad del dato? Si sí, **se conserva** aunque cueste un paso;
4. si sólo es "útil por las dudas", **queda fuera del camino principal** o no existe.

### 7.6 Mini nube contextual

`[DECISIÓN]` Una señal discreta puede revelar detalle al hover/toque y desaparecer al salir. No llenar la pantalla permanentemente.

### 7.7 Presupuesto de atención

`[DECISIÓN]` El silencio es el estado normal (D12). Las clases de Asunto (4.17) regulan quién puede interrumpir.

`[PROPUESTA]` Límite explícito de Asuntos que pueden interrumpir simultáneamente en el Dashboard, para que la atención sea un recurso administrado y no una lista infinita. → Q-14.

### 7.8 Dashboard

`[DECISIÓN]` El dashboard responde primero **¿cómo está mi negocio?**, no *¿cuántos gráficos podemos mostrar?*.

`[DECISIÓN]` Contenido de P2: salud general (aunque sea ⚪), ventas del día/semana/mes, cobrado vs pendiente, gastos registrados, stock que requiere atención, actividad relevante, Asuntos.

`[DECISIÓN]` Posterior según evidencia: Posición registrada destacada, oportunidades, calendario, conexiones, contador, evolución histórica.

`[DECISIÓN]` Descartado: dashboard saturado, múltiples scores, indicadores sin acción ni interpretación.

`[CONFLICTO]` **CF-05.** La reconstrucción exacta del dashboard de Prototype 1 **no es recuperable** (auditoría, Parte F). El orden de cards de P2 es diseño nuevo guiado por prioridad empresarial, **no** una reconstrucción histórica. No se debe afirmar lo contrario.

### 7.9 Voz

`[DECISIÓN]` Clara, paraguaya, voseo, profesional. Sin prometer IA mágica. Sin inventar testimonios. Sin afirmar resultados no validados. Sin jerga técnica.

`[DECISIÓN]` *"Esto todavía no lo sabemos"* es preferible a falsa precisión.

### 7.10 Interaction Principles

`[CONFLICTO / PENDIENTE]` **CF-06.** El bloque 6 de los principios de interacción **nunca se terminó** (auditoría, Parte F.7). No se inventa acá. Queda como trabajo pendiente explícito. → Q-15.

---

## 8. Accesos

### 8.1 Roles

`[DECISIÓN]` **Dueño:** visión completa.

`[DECISIÓN]` **Contador:** acceso propio y específico.

`[FUTURO]` **Vendedor:** workspace operacional limitado — registrar ventas, seleccionar productos, cobrar, trabajar con clientes — sin acceso a rentabilidad estratégica, salud completa ni información sensible del dueño. Con herramientas en contexto (D16): calculadora de vuelto, descuentos, porcentajes.

`[DECISIÓN]` Principios: *la atención debe corresponder a la responsabilidad de quien la recibe*; *cada persona ve únicamente información y acciones necesarias para su trabajo*.

### 8.2 Contador

`[DECISIÓN]` Usuario especial `contador`. **No consume asiento.** Invitación y revocación por el dueño. Alcance mínimo por defecto. Actividad trazable y visible para el dueño.

`[DECISIÓN]` Puede, por defecto: **leer y exportar** ventas, gastos, compras/costos, cobros y copias de documentos permitidos.

`[DECISIÓN]` No puede, por defecto: editar catálogo, ventas, usuarios, configuración ni reglas del negocio.

`[DECISIÓN]` Toda ampliación de permisos debe ser **explícita y visible**.

`[DECISIÓN]` Señal UX contextual: **● Contador conectado**.

`[HIPÓTESIS / ABIERTO]` H-04 — La **matriz granular de permisos** (RBAC por módulo, lectura/escritura) **no está cerrada y no se inventa acá**. → Q-16.

`[PROPUESTA]` En P2-B, si existen comprobantes bancarios, definir si el contador los ve por defecto. Es evidencia documental, no operación; puede requerir criterio distinto. → Q-17.

### 8.3 Asientos y planes

`[DECISIÓN]` Empleados y capacidades son **ejes distintos**: un asiento no equivale a un plan.

`[DECISIÓN]` Guardrail de monetización: **un plan superior profundiza valor; nunca secuestra la claridad básica.** El rojo jamás se usa para vender (D13).

`[HIPÓTESIS]` H-05 — SaaS recurrente; núcleo operativo accesible + capacidades avanzadas de inteligencia en niveles superiores.

`[FUTURO]` Land-and-expand mediante más valor/conexiones/capacidades. Capacidades Pro candidatas: análisis históricos profundos, comparaciones, patrones, proyecciones, oportunidades avanzadas, acompañamiento.

`[DECISIÓN]` **Pricing no se define en este documento.** No se importan los valores considerados para Gestio.

---

## 9. Prototype 2

### 9.1 Objetivo

`[DECISIÓN]` Construir una versión funcional para **una tienda de ropa real** que permita operar lo esencial y, **sobre esos mismos datos**, empezar a entender el negocio.

### 9.2 Navegación

`[DECISIÓN]` **Áreas funcionales actualmente consideradas para P2:** Dashboard · Ventas · Productos · Inventario · Clientes · Cobros · Gastos · Asuntos (ver CF-03) · Contador · Configuración.

`[DECISIÓN]` **Las áreas funcionales del dominio no equivalen automáticamente a entradas de navegación. La navegación final permanece abierta bajo D18 / Q-18.**

Esta lista describe **qué debe poder hacerse** en P2, no cómo se agrupa ni cuántas entradas de menú existen.

`[DECISIÓN]` La navegación se resuelve **bajo la restricción D18**: la existencia de una entidad no justifica una entrada de menú. Compras, Posición registrada, Comprobantes y Calendario existen en el dominio; **no está decidido** que existan como módulos visibles.

`[CONFLICTO]` **CF-09.** La `[PROPUESTA]` anterior de este documento sugería dar entradas de navegación propias a Compras, Posición registrada, Bancos/Comprobantes y Calendario. **Eso contradice D18** y queda **retirada**. La pregunta Q-18 se reformula: no *dónde ubicar cuatro módulos nuevos*, sino **cuántas entradas de navegación tolera ARKAN sin parecer un ERP, y qué entidades viven dentro de otras pantallas en lugar de tener la suya.**

`[PROPUESTA]` Dirección de trabajo, sujeta a Q-18: la compra puede vivir dentro de Inventario (es una entrada de stock), la Posición registrada puede vivir dentro del área financiera junto a Gastos, y la evidencia puede vivir dentro de la operación que documenta hasta que el centro de P2-B la justifique. Ninguna de estas ubicaciones está decidida.

`[CONFLICTO]` **CF-07.** La lista de 10 módulos de `ARKAN_PROJECT_STATE.md` y `ARKAN_CONTROL_PRODUCT.md` **no contempla** Compras, Posición registrada, Comprobantes ni Calendario, que ahora forman parte del alcance decidido del **dominio**. Bajo D18, esto **no implica automáticamente cuatro módulos nuevos**: implica que los documentos dueños deben distinguir entre *alcance del dominio* y *arquitectura de navegación*, que hoy mezclan.

### 9.3 P2-A — núcleo operativo conectado

`[DECISIÓN]` Alcance de P2-A:

- navegación funcional;
- catálogo con variantes talle/color + carga rápida/masiva;
- ventas (contado, parcial, pendiente) con descuentos por línea y global;
- correcciones: devolución, merma, `ERROR_DE_CARGA`;
- inventario derivado con movimientos, mínimos, ajuste con motivo;
- clientes con historial y saldo;
- cobros totales y parciales;
- gastos;
- compras con estado PENDIENTE/PAGADA y pago como evento;
- aporte y retiro del dueño;
- Posición registrada;
- costeo por promedio ponderado móvil con snapshot en línea de venta (4.10);
- vinculación de evidencia desde la operación: comprobante de transferencia y referencia/copia de factura externa, **sin bloquear la venta** (4.4 / 4.16);
- Asuntos básicos basados en reglas verificables (stock bajo, cobro atrasado, datos faltantes);
- Dashboard operativo;
- Business Health en ⚪ **Información insuficiente** con explicación de qué falta;
- historial y auditoría;
- acceso del contador;
- datos de prueba coherentes de una tienda de ropa.

`[DECISIÓN]` En P2-A, Business Health **no muestra puntuación**. Muestra estado de cobertura e ⚪ Información insuficiente, explicando qué datos faltan.

### 9.4 P2-B — organización y contexto

`[DECISIÓN]` Alcance de P2-B:

- **centro organizado** de Bancos y Comprobantes: bancos, cuentas, búsqueda, filtros, archivo, documentos pendientes de vincular (4.16);
- Calendar Lite (4.18);
- refinamiento de Asuntos y explicaciones;
- exportaciones básicas para el contador, cuando se definan.

### 9.5 Inteligencia en P2

`[DECISIÓN]` **Ligera.** No se construye todavía el cerebro completo de ARKAN.

`[DECISIÓN]` Todo Asunto de P2 nace de una **regla verificable sobre datos existentes**, no de inferencia estadística.

`[DECISIÓN]` Patrón obligatorio, siempre: **DETECTAR → ALERTAR → EXPLICAR → RECOMENDAR → SEGUIR.**

### 9.6 Facturación

`[DECISIÓN]` Externa. ARKAN puede conservar número/referencia y copia. **No emite, no firma, no transmite.**

---

## 10. Hipótesis y preguntas abiertas

### 10.1 Hipótesis a validar

| ID | Hipótesis |
|---|---|
| H-01 | La consulta rápida de disponibilidad por talle/color es una necesidad central del ICP. |
| H-02 | Las dimensiones ventas/cobros/inventario/rentabilidad/clientes/operación son las correctas para alimentar la salud general. |
| H-03 | Fórmula, pesos, thresholds y nombre definitivo de Business Health. |
| H-04 | Matriz granular de permisos del contador. |
| H-05 | Modelo SaaS recurrente con núcleo accesible + inteligencia en niveles superiores. |
| H-06 | La consecuencia visible al registrar (D6) produce satisfacción real y no fricción. |
| H-07 | El dueño acepta que Business Health empiece en ⚪ sin sentir que el producto "no funciona". |
| H-08 | Registrar compras dentro de ARKAN es aceptable para el negocio y no se percibe como carga administrativa extra. |
| H-09 | El flujo habitual de venta de ARKAN puede ser significativamente más simple y rápido que el método actual del negocio, hasta sentirse inmediato y natural una vez configurado el catálogo. |
| H-10 | El promedio ponderado móvil produce un margen que el dueño reconoce como correcto y explicable en su realidad de compras a distinto precio. |

### 10.2 Preguntas abiertas

| ID | Pregunta | Bloquea |
|---|---|---|
| Q-01 | ¿Moneda única en guaraníes, montos enteros? | Modelo de montos |
| Q-02 | ¿Generación asistida de matriz talles × colores? | Alta de catálogo |
| ~~Q-03~~ | ~~¿Método de costeo?~~ | **CERRADA** → promedio ponderado móvil + snapshot (4.10) |
| Q-04 | ¿Se permite stock negativo? | Venta |
| Q-05 | ¿Motivo obligatorio en devolución? | Devolución |
| Q-06 | ¿Merma fuera de devolución (rotura/pérdida/robo)? | Inventario |
| Q-07 | ¿Vencimiento opcional en venta pendiente? | Cobros y Asuntos |
| Q-08 | ¿Proveedor como texto libre en P2? | Compras |
| Q-09 | ¿Lista cerrada de entradas/salidas de Posición registrada? | Posición registrada |
| Q-10 | ¿Un comprobante sin vincular genera Asunto? | P2-B |
| Q-11 | ¿El módulo se llama Asuntos o Pendientes? (CF-03) | Navegación |
| Q-12 | ¿Se confirma la lectura de estados internos por dimensión? (CF-04) | Business Health |
| ~~Q-13~~ | ~~¿La consecuencia visible bloquea el siguiente registro?~~ | **CERRADA** → nunca bloquea (6.2) |
| Q-14 | ¿Cuántos Asuntos pueden interrumpir a la vez? | Dashboard |
| Q-15 | Interaction Principles — bloque 6 sin terminar (CF-06) | Sistema de diseño |
| Q-16 | Matriz RBAC granular | Accesos |
| Q-17 | ¿El contador ve comprobantes bancarios por defecto? | P2-B |
| Q-18 | ¿Cuántas entradas de navegación tolera ARKAN sin parecer un ERP, y qué entidades viven dentro de otras pantallas? (CF-07, CF-09, D18) | Navegación |
| Q-19 | ¿La evidencia adjuntada en P2-A necesita ya un tipo documental, o eso llega con el centro de P2-B? | P2-A / P2-B |

`[DECISIÓN]` Con Q-03 cerrada, **ya no queda ninguna pregunta bloqueante del modelo de dominio.** Las que siguen abiertas afectan navegación, accesos y sistema de diseño, no la corrección de los datos.

`[DECISIÓN]` **Q-18 es ahora la pregunta abierta más importante**, porque D18 la convirtió en una restricción de producto y no en una decisión de menú.

---

## 11. Roadmap

`[DECISIÓN]` Secuencia:

**P2-A — núcleo operativo conectado.** Ver 9.3.

**P2-B — organización y contexto.** Ver 9.4.

**Piloto real.** Un negocio de indumentaria. Validar H-01, H-06, H-07, H-08.

**Post-piloto — Business Health real.** Sólo si el piloto entrega cobertura suficiente para definir dimensiones, umbrales y explicación (H-02, H-03).

**Después:**

`[FUTURO]`
- inteligencia de inventario: rotación, días de cobertura, valorización, stock inmovilizado, reposición sugerida, anomalías;
- calendario inteligente y estacionalidad;
- rol vendedor y Sales Workspace con herramientas en contexto;
- comparaciones longitudinales, patrones y predicciones prudentes con incertidumbre expresada;
- recordatorios inteligentes de cobranza;
- integraciones (API, webhooks, bancos, facturadores de terceros, WhatsApp);
- ARKAN Business Discovery: Escuchar → Observar → Detectar → Construir → Mejorar → Medir;
- segundo rubro, sólo después de validar el primero.

`[DECISIÓN]` No se construye una integración futura antes de que exista un caso real que justifique el costo.

---

## 12. Qué no vamos a construir

`[DECISIÓN]` Fuera de alcance, sin excepción para P2:

**Fiscal**
- SIFEN, DNIT, timbrado, firma digital, certificados, clave privada, CSC, KuDE como emisión, XML fiscal, Notas Técnicas, PSC, transmisión, custodia de certificados, firma remota, delegación fiscal, responsabilidades legales del facturador.

**Producto**
- ERP; contabilidad; POS genérico multi-rubro; restaurantes/mesas/comandas; hardware; CRM complejo; desarrollo a medida por cliente; multi-sucursal; multi-moneda.

**Bancos**
- integración automática, lectura de movimientos, open banking, conciliación, transferencias, credenciales, conexión directa.

**Inteligencia**
- score con fórmula inventada; número de salud sin cobertura; múltiples scores decorativos; IA generativa autónoma decidiendo por el dueño; predicciones sin expresar incertidumbre; IA que aparente saber más de lo que sabe.

**Experiencia**
- gamificación (medallas, puntos, rachas, recompensas); dashboard saturado; indicadores sin acción ni interpretación; urgencia artificial; rojo para vender; spam de fechas genéricas; alertas que no justifican una decisión.

**Modelo**
- saldo a favor / crédito interno del cliente en P2; pagos parciales a proveedores en P2; entidad compleja de proveedor y cuentas por pagar en P2.

---

## 13. Registro de decisiones

### 13.1 Decisiones cerradas durante esta consolidación

| ID | Decisión | Sección |
|---|---|---|
| MP-001 | Simplicidad operativa: mínima entrada, máxima propagación. ARKAN no es un POS pesado. | D5 |
| MP-002 | Carga con valor inmediato: todo dato registrado produce consecuencia visible **si existe consecuencia empresarial real**. | D6 |
| MP-003 | Ventas brutas, correcciones y ventas netas son tres cifras visibles; ninguna se oculta. | 4.5 |
| MP-004 | Business Health y comparativos usan **ventas netas**. | 4.5 / 4.20 |
| MP-005 | Las correcciones se imputan al período en que ocurren, no al período original. | 4.5 |
| MP-006 | P2 **no** incorpora saldo a favor del cliente. | 4.6 |
| MP-007 | Resolución económica de devolución: pagada → reembolso; pendiente → reduce saldo; parcial → saldo primero, excedente reembolso. | 4.6 |
| MP-008 | Existe `ERROR_DE_CARGA` con cinco condiciones estrictas; visible en historial, excluido de métricas. | 4.7 |
| MP-009 | Merma: no reingresa, no vuelve a descontar, revierte ingreso, **no** revierte costo, queda trazable. | 4.8 |
| MP-010 | Compra con estado PENDIENTE/PAGADA; pago como evento independiente; sin pagos parciales a proveedor en P2; sin entidad compleja de proveedor. | 4.12 |
| MP-011 | Compra afecta inventario; pago afecta Posición registrada; el CMV afecta resultado. | 4.12 |
| MP-012 | Existen `APORTE_DUENO` y `RETIRO_DUENO`: afectan Posición registrada y **nunca** Business Health como gasto o ingreso. | 4.14 |
| MP-013 | Descuento por línea y descuento global; el global se prorratea internamente para conservar margen por producto. | 4.4 |
| MP-014 | El concepto se llama **Posición registrada**, no Caja. Es vista derivada, no arqueo ni conciliación. Cada movimiento conserva método de pago. | 4.15 |
| MP-015 | Bancos y comprobantes entran en **P2-B** como organización de evidencia; sin credenciales; sin integración bancaria. | 4.16 |
| MP-016 | **El comprobante es evidencia, no una segunda operación.** Sin vincular → no afecta nada. | 4.16 |
| MP-017 | Separación absoluta Business Health / Connection Status. El rojo es exclusivamente empresarial. | 4.21 |
| MP-018 | Calendario en P2-B es **Calendar Lite**: sólo eventos propios de la empresa. | 4.18 |
| MP-019 | Objeto transversal único: **Asunto**, con clases PROGRESO / OPORTUNIDAD / ATENCIÓN / CRÍTICO que determinan el derecho a interrumpir. | 4.17 |
| MP-020 | La recomendación es un **campo** del Asunto, no otra entidad. | 4.17 |
| MP-021 | Business Health arranca en ⚪ Información insuficiente. Costo ausente ≠ G. 0. Nunca margen artificial. Cobertura es criterio de habilitación. Thresholds siguen siendo hipótesis. | 4.20 |
| MP-022 | Este Master Plan tiene precedencia conceptual, pero toda corrección debe bajarse al documento dueño. | 0.4 |
| MP-023 | P2 se divide formalmente en **P2-A** (núcleo operativo conectado) y **P2-B** (organización y contexto). | 9.3 / 9.4 |

**Segunda consolidación:**

| ID | Decisión | Sección |
|---|---|---|
| MP-024 | **Connection First (D17):** las conexiones entre hechos del negocio son una ventaja central del producto. El dueño hace una cosa; ARKAN conecta el resto. Amplía D9. | D17 |
| MP-025 | Ninguna conexión artificial: toda conexión representa consecuencia empresarial real y conserva origen y trazabilidad. | D17 |
| MP-026 | **Complejidad interna ≠ complejidad de interfaz (D18):** la cantidad de entidades y conexiones internas nunca determina pantallas, módulos ni pasos. No convertir cada entidad en navegación. | D18 |
| MP-027 | **Fast Capture (D19):** flujo de venta producto/variante → cantidad → medio/estado de pago → confirmar. Cliente y descuentos sólo cuando corresponde. Información adicional progresiva. | D19 |
| MP-028 | **No existe umbral temporal decidido.** ARKAN no se diseña alrededor de un número de segundos. Criterio: **menor esfuerzo razonablemente posible para registrar un hecho correctamente**; eliminar todo paso sin consecuencia empresarial; no sacrificar integridad por velocidad; no pedir datos "por las dudas". El nivel razonable lo determinará el piloto. | D19 / 7.5b |
| MP-029 | **Evidencia conectada sin frenar la operación:** P2-A permite vincular comprobante y factura externa desde la venta/cobro; **la evidencia nunca bloquea** la finalización de una venta normal. | 4.4 / 4.16 |
| MP-030 | La capacidad se divide: **P2-A adjunta desde la operación; P2-B organiza** (bancos, cuentas, búsqueda, filtros, archivo, pendientes). Enmienda MP-015. | 4.16 |
| MP-031 | **La consecuencia visible nunca bloquea el siguiente registro.** Feedback inmediato, sutil, comprensible y no bloqueante. Prohibidas las pantallas de éxito con click obligatorio. Cierra Q-13. | 6.2 |
| MP-032 | **Costeo: promedio ponderado móvil + snapshot de costo en la línea de venta.** Los cambios posteriores de costo nunca modifican margen histórico. Devolución vendible reingresa al costo snapshot. Cierra CF-01/Q-03. | 4.10 |
| MP-033 | **Principio de tiempo:** ARKAN devuelve tiempo eliminando carga duplicada, conectando consecuencias y acelerando la comprensión. Criterio interno de éxito, no promesa cuantificada hasta medirlo. | 2.2 |

### 13.2 Conflictos detectados — **no resueltos silenciosamente**

| ID | Conflicto | Estado |
|---|---|---|
| CF-01 | Método de costeo nunca decidido; margen, merma y valorización dependen de él. | **RESUELTO.** Promedio ponderado móvil + snapshot en línea de venta (MP-032, 4.10). |
| CF-02 | "Caja" aparece en `ARKAN_DATA_CONNECTIONS.md`, `ARKAN_CONTROL_PRODUCT.md` y `ARKAN_RECOVERY_AUDIT.md`; ahora es "Posición registrada". | Requiere actualizar documentos dueños. |
| CF-03 | Módulo *Pendientes / Inteligencia* vs. entidad **Asunto**. | Abierto → Q-11. |
| CF-04 | `CLAUDE.md` regla 9 ("nunca scores por módulo") vs. auditoría §12 ("estado interno por dimensión"). | Abierto → Q-12. Lectura propuesta: estados internos = causas, nunca publicadas como scores. |
| CF-05 | El dashboard de Prototype 1 no es reconstruible; el de P2 es diseño nuevo. | Reconocido. No afirmar reconstrucción histórica. |
| CF-06 | Interaction Principles, bloque 6, nunca se terminó. | Abierto → Q-15. **No inventar.** |
| CF-07 | La lista de 10 módulos no contempla Compras, Posición registrada, Bancos/Comprobantes ni Calendario. | Requiere actualizar documentos dueños → Q-18. |
| CF-08 | `ARKAN_PROJECT_STATE.md` lista "Cobros" y "Gastos" pero no Compras; sin embargo el inventario siempre requirió entradas. La compra pasa de implícita a explícita. | Requiere actualizar `ARKAN_CONTROL_PRODUCT.md`. |
| **CF-09** | **La `[PROPUESTA]` de navegación de la v1.0 (entradas propias para Compras, Posición, Bancos, Calendario) contradice D18.** | **Detectado en esta consolidación.** Propuesta retirada. Q-18 reformulada. |
| **CF-10** | **MP-015 decía "Bancos y comprobantes entran en P2-B"; la decisión 4 de esta ronda mueve la vinculación de evidencia a P2-A.** | **Detectado en esta consolidación.** MP-015 queda **enmendado** por MP-030: la división es adjuntar (P2-A) / organizar (P2-B). Los documentos dueños deben recibir la versión enmendada, no la original. |
| **CF-11** | **Tensión entre D19 (captura de esfuerzo mínimo) y la regla de 4.4 que exige cliente en ventas pendientes o parciales.** | **Detectado en esta consolidación.** No es contradicción: el cliente en una venta a crédito tiene consecuencia empresarial real (sin él no hay cuenta por cobrar atribuible), así que pasa el filtro de D19. Pero si el piloto muestra que el negocio vende mayoritariamente a crédito, "la venta habitual" de H-09 es la venta con cliente y hay que evaluar el flujo sobre ese caso, no sobre el contado. |

### 13.3 Preguntas deliberadamente abiertas

Ver tabla 10.2 (Q-01 a Q-19). **Q-03 y Q-13 quedaron cerradas en esta consolidación.** Las que siguen abiertas y pesan:

- **Q-18 — cuántas entradas de navegación tolera ARKAN.** Elevada a pregunta principal por D18 y CF-09. Bloqueante para la arquitectura de navegación.
- **Q-12 — estados internos por dimensión.** Bloqueante para el diseño de Business Health.
- **Q-16 — matriz RBAC del contador.** Bloqueante para ampliar permisos más allá del default.
- **Q-15 — Interaction Principles.** Bloqueante para cerrar el sistema de diseño.
- **Pricing.** Fuera de este documento por decisión.
- **Nombre definitivo de Business Health.** Sin cerrar.

`[DECISIÓN]` Ninguna pregunta abierta bloquea hoy la corrección del **modelo de dominio**. Todas las restantes son de navegación, accesos o diseño.

### 13.4 Hipótesis que el primer piloto debe validar

1. **H-01** — Consulta de disponibilidad por talle/color como necesidad central.
2. **H-06** — La consecuencia visible al registrar produce satisfacción real, no fricción.
3. **H-07** — El dueño tolera ⚪ Información insuficiente sin sentir que el producto falla.
4. **H-08** — Registrar compras dentro de ARKAN no se percibe como carga administrativa extra.
5. **H-02 / H-03** — Qué dimensiones y qué umbrales tienen sentido con datos reales.
6. Que las correcciones (devolución, merma, error de carga) cubran los casos reales del mostrador **sin necesitar saldo a favor**.
7. Que el negocio efectivamente registre en ARKAN el mismo día, condición necesaria para `ERROR_DE_CARGA`.
8. Que ninguna alerta mostrada durante el piloto haya sido innecesaria (auditoría de atención gastada, D12).
9. **H-09 / H-10** — velocidad de captura y explicabilidad del costo promedio.

`[DECISIÓN]` **Mediciones obligatorias del piloto sobre la venta:**

- tiempo real de registro de una venta habitual;
- número de interacciones necesarias;
- **pasos donde el usuario duda o se detiene**;
- campos que podrían eliminarse o derivarse;
- **diferencia frente al proceso que el negocio utilizaba antes de ARKAN**;
- frecuencia de uso de los campos opcionales;
- proporción de ventas al contado vs. pendientes/parciales (ver CF-11).

`[DECISIÓN]` **Los datos del piloto determinarán posteriormente qué nivel de velocidad es razonable. No se establece ahora ningún threshold numérico.**

`[DECISIÓN]` Nada de esto se convierte en claim comercial hasta ser medido en negocios reales (MP-028, MP-033).

### 13.5 Condiciones para declarar P2 listo para un primer negocio real

`[DECISIÓN]` P2 se declara listo **sólo si se cumplen todas**:

**Correctitud del dominio**
1. Una venta confirmada propaga correctamente a inventario, cliente, cobro/saldo, Posición registrada, métricas e historial, sin doble carga.
2. Devolución, merma y `ERROR_DE_CARGA` producen exactamente los efectos definidos en 4.6, 4.7 y 4.8 — verificados caso por caso.
3. Ventas brutas, correcciones y netas son consistentes y reconciliables entre sí.
4. Compra y pago de compra afectan lo que deben y sólo lo que deben.
5. Aporte y retiro afectan Posición registrada y **no** afectan Business Health.
6. La Posición registrada reconstruye su saldo a partir de sus movimientos, sin descuadre.

**Trazabilidad**
7. Toda cifra del Dashboard puede abrirse hasta las operaciones que la componen.
8. Todo movimiento responde qué, cuándo, quién, desde dónde y qué cambió.
9. Ninguna corrección borró historia.

**Conexiones y evidencia**
6b. Una venta produce **todas** las conexiones correctas **sin cargas duplicadas** (D17).
6c. Una factura o comprobante puede **rastrearse hasta la operación a la que pertenece**.
6d. **Ninguna operación se duplica al adjuntar evidencia** (MP-016).

**Experiencia**
10. Registrar una venta típica del negocio toma menos pasos que el método actual del comercio.
10b. **La venta habitual demuestra en el piloto un flujo claramente simple, rápido e intuitivo, con menos fricción administrativa que el proceso anterior del negocio.**
10f. **Todo paso del flujo habitual tiene una razón empresarial real**; si un paso puede derivarse o eliminarse sin perder integridad, no debe existir.
10c. Después de confirmar, el usuario **puede iniciar la siguiente venta inmediatamente** (MP-031).
10d. **Ninguna evidencia documental obligatoria frena una venta habitual** (MP-029).
10e. **La navegación no expone complejidad innecesaria del dominio** (D18).
11. Cada registro muestra su consecuencia real de forma comprensible (D6).
12. Ninguna pantalla muestra una cifra que no pueda explicar su origen.
13. El onboarding se percibe como **conectar el negocio**, no configurar software.

**Honestidad**
14. Business Health muestra ⚪ con explicación de qué falta, y **no** una puntuación inventada.
15. No existe ningún margen calculado sobre costo ausente, y todo margen puede explicarse hasta las compras que formaron el promedio (MP-032).
16. Todo Asunto mostrado tiene detección, evidencia, explicación y, si corresponde, recomendación y seguimiento.
17. Ningún comprobante sin vincular afecta métricas.

**Accesos**
18. El contador puede leer y exportar lo permitido, no puede editar, no consume asiento, es revocable y su actividad es visible.

**Datos**
19. Existe un set de datos de prueba coherente de una tienda de ropa que ejercita todos los casos anteriores, incluidos los correctivos.

**Documentación**
20. Los conflictos **CF-02 a CF-11** están resueltos o explícitamente diferidos con registro, y las decisiones bajaron a sus documentos dueños. (CF-01 ya está resuelto.)

---

## Nota final de método

`[DECISIÓN]` Este documento **no crea repositorio, no modifica documentos existentes y no implementa nada**. El siguiente paso natural es:

1. revisar este Master Plan;
2. resolver los conflictos CF-01 a CF-08 y las preguntas bloqueantes;
3. bajar las decisiones a los documentos dueños según `ARKAN_INDEX.md`;
4. recién entonces crear `arkan-control`.

> La complejidad existe detrás de ARKAN, nunca delante del usuario.

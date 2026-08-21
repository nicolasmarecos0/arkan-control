# ARKAN\_CONTROL\_P2\_IMPLEMENTATION\_BRIEF\_v1.0

**Estado:** documento de construcción — v1.0 — **FINAL / APROBADO PARA CONSTRUCCIÓN**  
**Producto:** ARKAN Control (ARKAN Growth)  
**Alcance:** Prototype 2 — Fase **P2-A** (núcleo operativo conectado)  
**ICP de validación:** tienda de ropa / indumentaria, Paraguay  
**Fuente conceptual única:** `ARKAN_CONTROL_MASTER_PLAN_v1.0` — **APPROVED / FROZEN**  
**Q-18:** **CERRADA para P2-A** — navegación de 5 áreas + Libro de Hechos contextual aprobados.

---

## 0. Cómo usar este documento

### 0.1 Para qué existe

El Master Plan responde **qué es ARKAN Control y por qué**. Este brief responde **qué se construye en P2-A y bajo qué reglas**, sin que nadie tenga que inventar una regla de dominio durante la construcción.

Este documento **no es código, no es esquema de base de datos, no es especificación de UI pixel a pixel**. Es el contrato de construcción de P2-A.

### 0.2 Precedencia

1. `ARKAN_CONTROL_MASTER_PLAN_v1.0` (FROZEN) tiene precedencia conceptual.
2. Este brief **no crea doctrina nueva**: deriva, precisa y cierra lo mínimo necesario para construir P2-A.
3. Si durante la construcción aparece una contradicción entre este brief y el Master Plan, **se detiene y se señala**. No se resuelve silenciosamente.
4. Ningún cambio de ARKAN modifica Gestio.

### 0.3 Etiquetas

| Etiqueta Significado    |                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `[DECISIÓN]`            | Cerrado. Se implementa tal cual.                                                            |
| `[REGLA DERIVADA]`      | Consecuencia técnica obligatoria de una `[DECISIÓN]` del Master Plan. No es doctrina nueva. |
| `[PARÁMETRO DE PILOTO]` | Valor configurable, no doctrina. Se ajusta con datos reales sin reabrir arquitectura.       |
| `[FUERA DE P2-A]`       | Existe conceptualmente, no se construye ahora.                                              |
| `[ABIERTO]`             | Pregunta parqueada. No bloquea P2-A. No se inventa.                                         |

**Regla dura:** si algo no está en este brief como `[DECISIÓN]` o `[REGLA DERIVADA]`, **no es requisito de P2-A**.

---

## 1. Objetivo de P2-A

`[DECISIÓN]` Construir una versión funcional para **una tienda de ropa real** que permita:

1. registrar la operación diaria con el menor esfuerzo razonable (D5, D19);
2. propagar automáticamente cada hecho a todo lo que realmente afecta (D9, D17);
3. explicar el origen de cualquier cifra (D10);
4. mostrar Business Health en ⚪ **Información insuficiente** con explicación honesta de qué falta (D11, MP-021).

`[DECISIÓN]` **P2-A no intenta ser inteligente.** Toda alerta nace de una regla verificable sobre datos existentes (MP: 9.5).

### 1.1 Criterio de éxito de la fase

> Una tienda real registra su día completo en ARKAN, con menos pasos que su método actual, y todo lo registrado se puede explicar hasta su origen.

---

## 2. Arquitectura de navegación aprobada (cierre de Q-18)

`[DECISIÓN]` Q-18 **CERRADA para P2-A**. Navegación operativa: **5 áreas**. Todo lo demás vive dentro de ellas o fuera de la navegación operativa.

| Área Contiene  |                                                                               |
| -------------- | ----------------------------------------------------------------------------- |
| **INICIO**     | Dashboard · Asuntos relevantes · Actividad reciente                           |
| **VENDER**     | Acción operativa primaria + historial de ventas (ver 2.2)                     |
| **CATÁLOGO**   | Productos · Variantes · Stock · Mínimos · Compras/entradas · Ajustes          |
| **CLIENTES**   | Clientes · Historial · Saldo · Cobros posteriores                             |
| **DINERO**     | Gastos · Aportes/Retiros · Posición registrada · Lectura cobrado vs pendiente |

**Fuera de la navegación operativa principal:** Configuración · Contador · Datos del Negocio.

`[DECISIÓN]` Alcance del cierre: esta arquitectura queda cerrada **para P2-A / piloto inicial**. **No** se declara navegación permanente e inmutable de todas las versiones futuras de ARKAN.

`[DECISIÓN]` Los nombres visibles —especialmente **DINERO**— pueden validarse y ajustarse con el negocio real **sin reabrir la arquitectura**.

`[DECISIÓN]` Consecuencia directa de D18: **Compras, Posición registrada, Cobros, Inventario y Evidencia no tienen entrada de navegación propia.** Existen en el dominio, viven dentro de las áreas anteriores.

### 2.1 VENDER no es un módulo de administración

`[DECISIÓN]` VENDER es una **acción**, no una sección administrativa. Debe ser alcanzable desde cualquier punto de la aplicación con el mínimo de pasos posible y abrir directamente el flujo de captura (D19).

### 2.2 Acceso al historial de ventas — cierre necesario

`[REGLA DERIVADA]` P2-A incluye devolución, `ERROR_DE_CARGA` y vinculación posterior de evidencia. Esas tres capacidades **exigen poder encontrar una venta ya registrada**. La arquitectura aprobada no crea un módulo "Ventas", así que:

`[DECISIÓN]` **VENDER tiene dos profundidades sobre el mismo destino** (Operar / Entender, MP 7.4):

- **registrar** una venta (camino por defecto, siempre primero);
- **encontrar** una venta registrada para corregirla, devolverla, anularla por error de carga o adjuntarle evidencia.

`[DECISIÓN]` La misma venta es alcanzable además desde: ficha del **Cliente**, **Actividad reciente** en INICIO, y **Libro de Hechos** contextual.

`[DECISIÓN]` Esto **no agrega una entrada de navegación**. Es profundidad dentro de una existente.

### 2.3 Libro de Hechos

`[DECISIÓN]` La línea de tiempo / historial transversal existe como **componente reutilizable contextual**, no como destino principal obligatorio.

`[DECISIÓN]` Puede aparecer contextualizado dentro de: producto/variante · cliente · venta · Posición registrada · cualquier otra operación que necesite trazabilidad.

`[DECISIÓN]` Estructura invariable de cada hecho:

```
qué ocurrió → cuándo → quién → origen → consecuencias

```

`[DECISIÓN]` **Fuente única.** El Libro de Hechos lee la misma tabla de eventos que produce la auditoría. **Prohibido duplicar datos para producir historiales.**

`[REGLA DERIVADA]` El Libro de Hechos es **lectura filtrada por entidad**, no una entidad nueva.

---

## 3. Modelo de dominio ejecutable

> Sección 4 del Master Plan, precisada a nivel de construcción. Campos mínimos: lo que **debe** existir. Cualquier campo adicional debe justificarse con una consecuencia empresarial real (D19, 7.5b).

### 3.1 Convenciones transversales

`[DECISIÓN]` Toda entidad operativa conserva: **id · negocio · fecha\_del\_hecho · fecha\_de\_registro · actor · origen · estado**.

`[DECISIÓN]` **Fecha del hecho ≠ fecha de registro.** Las métricas de período usan **fecha del hecho**.

`[DECISIÓN]` **Nada se borra físicamente.** Toda corrección es un evento nuevo.

`[DECISIÓN]` **Un solo negocio por cuenta** en P2-A. Sin sucursales, sin depósitos múltiples.

`[DECISIÓN]` **Arquitectura multiusuario desde el inicio**, aunque P2-A opere con dueño + contador.

#### Moneda y montos — cierre de Q-01

`[DECISIÓN]` **MP-035.** Moneda única: **guaraní**. Montos **enteros**, sin decimales. Multi-moneda queda `[FUERA DE P2-A]`.

`[REGLA DERIVADA]` Todo cálculo interno que produzca fracciones (prorrateo de descuento, costo promedio) se resuelve así:

- el **costo promedio ponderado móvil** se almacena con precisión decimal interna y **se muestra redondeado**;
- los **montos de documento** (líneas, totales, cobros, saldos) son **enteros**;
- en el prorrateo de descuento global se usa **reparto proporcional con residuo**: `descuento_i = piso(D × subtotal_i / Σsubtotal)`, y el residuo `D − Σdescuento_i` se asigna de a G. 1 empezando por la línea de mayor subtotal;
- **invariante:** `Σ(subtotal_i − descuento_i) = total de la venta`, sin excepción.

### 3.2 Entidades de P2-A

| Entidad Campos mínimos Estados        |                                                                                                                                          |                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Negocio**                           | nombre, saldo inicial declarado, fecha del saldo inicial                                                                                 | —                                                  |
| **Usuario/Acceso**                    | nombre, rol (`DUENO` / `CONTADOR`), estado                                                                                               | activo / revocado                                  |
| **Categoría**                         | nombre                                                                                                                                   | activa / inactiva                                  |
| **Producto**                          | nombre, categoría, SKU base (opcional), estado                                                                                           | activo / inactivo                                  |
| **Variante**                          | producto, talle, color, SKU, precio, costo vigente, stock mínimo, estado                                                                 | activa / inactiva                                  |
| **Cliente**                           | nombre, contacto (opcional)                                                                                                              | activo / inactivo                                  |
| **Venta**                             | fecha del hecho, cliente (condicional), líneas, descuento global, total, estado de cobro, referencia/copia de factura externa (opcional) | pagada / parcial / pendiente / anulada\_por\_error |
| **Línea de venta**                    | variante, cantidad, precio unitario, descuento de línea, **costo\_al\_momento (snapshot)**                                               | —                                                  |
| **Movimiento de inventario**          | variante, tipo, cantidad (con signo), motivo (según tipo), operación de origen                                                           | —                                                  |
| **Cobro**                             | venta, cliente, fecha, monto, método de pago                                                                                             | —                                                  |
| **Gasto**                             | fecha, categoría, monto, descripción, método de pago                                                                                     | —                                                  |
| **Compra**                            | fecha, proveedor (texto libre), líneas (variante, cantidad, costo unitario), total, estado                                               | pendiente / pagada                                 |
| **Pago de compra (`PagoCompra`)**      | compra, fecha, monto, método de pago                                                                                                     | —                                                  |
| **Corrección de venta**               | venta original, tipo (`DEVOLUCION` / `ERROR_DE_CARGA`), líneas afectadas, motivo, resolución económica                                   | —                                                  |
| **Reembolso**                         | monto, fecha, método de pago, devolución de origen, venta original                                                                        | —                                                  |
| **Merma**                             | variante, cantidad, motivo, origen (devolución no vendible / pérdida directa)                                                            | —                                                  |
| **Aporte/Retiro**                     | tipo (`APORTE_DUENO` / `RETIRO_DUENO`), fecha, monto, método, nota                                                                       | —                                                  |
| **Movimiento de Posición registrada** | tipo, monto (con signo), método de pago, operación de origen                                                                             | —                                                  |
| **Asunto**                            | clase, regla que lo generó, detección, evidencia, explicación, recomendación (opcional), estado, seguimiento                             | abierto / en seguimiento / resuelto / descartado   |
| **Comprobante / evidencia**           | archivo o referencia, operación vinculada, fecha, monto (opcional), tipo documental derivado                                             | vinculado / (ver 3.9)                              |
| **Evento de historial**               | qué, cuándo, quién, origen, consecuencias, entidades afectadas                                                                           | —                                                  |

`[REGLA DERIVADA]` **Movimiento de inventario** y **Movimiento de Posición registrada** son **derivados**: nunca se crean a mano desde una pantalla de "movimientos". Nacen siempre de una operación.

### 3.3 Catálogo — Producto y Variante

`[DECISIÓN]` La **variante (talle + color)** es la unidad que tiene stock, costo y precio. El producto agrupa.

`[DECISIÓN]` Campos mínimos para dar de alta: **nombre, categoría, precio y al menos una variante.** Todo lo demás es profundidad opcional.

`[DECISIÓN]` **Carga rápida y carga masiva son requisito de P2-A.**

#### Matriz asistida — cierre de Q-02

`[DECISIÓN]` **MP-036.** Al crear un producto, ARKAN ofrece **generación asistida de la matriz talles × colores**:

- el usuario elige el set de talles y el set de colores;
- ARKAN propone todas las combinaciones y el usuario puede **destildar** las que no existen;
- las variantes se crean **activas, con stock 0**;
- el stock entra por compra/entrada o carga masiva, nunca por el alta del producto.

`[REGLA DERIVADA]` Precio y costo pueden definirse a nivel de producto y heredarse a todas las variantes, con **excepción por variante** cuando el negocio lo necesita. Motivo: en indumentaria el precio suele ser uniforme por modelo (D5).

`[DECISIÓN]` Inactivar **nunca** borra historial ni movimientos.

### 3.4 Venta

`[DECISIÓN]` Flujo por defecto (D19): **producto/variante → cantidad → medio/estado de pago → confirmar.**

`[DECISIÓN]` **Cliente:** opcional, **salvo** que la venta quede pendiente o parcial. En ese caso es obligatorio, porque sin cliente no hay cuenta por cobrar atribuible.

`[DECISIÓN]` **Descuentos:** por línea y global. El global se **prorratea internamente** (3.1). El usuario no ve el prorrateo (D4).

`[DECISIÓN]` Cada línea **congela** **`costo_al_momento`**. Los cambios posteriores de costo **nunca** modifican margen histórico.

`[DECISIÓN]` **Evidencia nunca bloquea la venta** (MP-029). Puede adjuntarse durante, inmediatamente después o mucho después.

`[DECISIÓN]` La confirmación **no bloquea el siguiente registro** (MP-031). Prohibidas las pantallas de éxito con click obligatorio.

#### Stock negativo — cierre de Q-04

`[DECISIÓN]` **MP-037.** La venta **no se bloquea** por falta de stock.

- ARKAN **advierte** de forma explícita y no modal;
- el usuario puede continuar;
- el stock resultante puede quedar **negativo** y eso queda registrado como tal;
- se genera un Asunto de clase **ATENCIÓN** (regla A4, ver 6.2) que dice qué falta registrar.

Motivo: el mostrador vende lo que tiene físicamente. Bloquear la venta trasladaría al cliente un problema de datos (D5, D19). Ocultar el negativo sería información artificial y rompería la trazabilidad (D10, D11).

### 3.5 Ventas brutas, correcciones y netas

`[DECISIÓN]` Tres cifras **siempre visibles y reconciliables**: brutas · correcciones · netas.

`[DECISIÓN]` Las correcciones se imputan al **período en que ocurren**, no al período original.

`[DECISIÓN]` Business Health y comparativos usan **ventas netas**.

`[DECISIÓN]` Las ventas anuladas por `ERROR_DE_CARGA` quedan **fuera de brutas y de netas**.

### 3.6 Devolución / corrección

`[DECISIÓN]` No existe saldo a favor ni crédito interno del cliente en P2.

`[DECISIÓN]` Resolución económica:

| Venta original Efecto  |                                                                |
| ---------------------- | -------------------------------------------------------------- |
| pagada                 | reembolso real → Posición registrada ↓                         |
| pendiente              | reduce el saldo pendiente                                      |
| parcial                | primero reduce saldo; si queda excedente ya cobrado, reembolso |

`[DECISIÓN]` Efecto sobre inventario:

- **vendible** → reingresa al stock **al costo snapshot** de la línea original;
- **no vendible** → **merma**, no reingresa.

#### Reembolso — cierre de semántica económica

`[DECISIÓN]` **MP-050.** Cuando una devolución exige devolver dinero efectivamente cobrado, se crea un **Reembolso** explícito con: **monto · fecha · método de pago · devolución de origen · venta original**.

`[DECISIÓN]` El método de pago del reembolso **no se hereda** automáticamente de la venta original: se registra el método real usado para devolver el dinero.

`[DECISIÓN]` Si la devolución **sólo reduce saldo pendiente**, no existe Reembolso, no existe movimiento de Posición registrada y no se pide método de pago. En una venta parcial, primero se reduce saldo y sólo el excedente ya cobrado genera Reembolso.

#### Motivo — cierre de Q-05

`[DECISIÓN]` **MP-038.** En toda devolución:

- la clasificación **vendible / no vendible** es **obligatoria** (determina inventario y costo);
- el **motivo es obligatorio cuando la unidad es no vendible**, porque genera una pérdida real que debe poder explicarse;
- el motivo es **opcional cuando es vendible** (no pedir datos "por las dudas", D19).

### 3.7 `ERROR_DE_CARGA`

`[DECISIÓN]` Sólo aplicable si se cumplen **las cinco** condiciones: mismo día · sin cobro asociado · sin devolución · sin eventos posteriores dependientes · con motivo.

`[DECISIÓN]` Efectos: permanece visible en historial · excluida de métricas · revierte el movimiento de inventario · **no** genera evento correctivo económico.

`[REGLA DERIVADA]` Si alguna condición no se cumple, la interfaz **no ofrece** la opción y explica por qué; el camino es devolución/corrección comercial.

### 3.8 Inventario, merma y costeo

`[DECISIÓN]` El stock **se deriva de movimientos**. Nunca se edita un número de stock directamente: se registra un movimiento.

`[DECISIÓN]` Tipos de movimiento en P2-A: `ENTRADA_COMPRA` · `SALIDA_VENTA` · `REINGRESO_DEVOLUCION` · `AJUSTE_MANUAL` (motivo obligatorio) · `MERMA` · `REVERSION_ERROR_CARGA`.

#### Merma fuera de devolución — cierre de Q-06

`[DECISIÓN]` **MP-039.** `MERMA` es un tipo de movimiento propio que **también** puede originarse fuera de una devolución (rotura, pérdida, robo), con **motivo obligatorio**.

Motivo: usar `AJUSTE_MANUAL` genérico para pérdidas destruiría la posibilidad futura de distinguir error de conteo vs. pérdida real. Es una distinción de dato, no una función nueva.

`[DECISIÓN]` Reglas de merma: no reingresa · no vuelve a descontar lo ya descontado por la venta · revierte el ingreso cuando viene de devolución · **no** revierte el costo consumido · queda trazable.

#### Costeo — reglas derivadas de MP-032

`[DECISIÓN]` **Promedio ponderado móvil** + **snapshot en línea de venta**.

`[REGLA DERIVADA]` Recálculo del costo vigente de una variante:

| Evento Efecto sobre costo vigente                   |                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ENTRADA_COMPRA`                                    | `nuevo = (stock × costo_vigente + cantidad × costo_compra) / (stock + cantidad)` |
| `ENTRADA_COMPRA` con stock ≤ 0                      | `nuevo = costo_compra`                                                           |
| `REINGRESO_DEVOLUCION`                              | mismo cálculo, usando **costo snapshot** de la línea original                    |
| `SALIDA_VENTA` · `MERMA` · `AJUSTE_MANUAL` negativo | **no modifica** el costo vigente                                                 |
| `AJUSTE_MANUAL` positivo sin costo declarado        | **no modifica** el costo vigente                                                 |

`[DECISIÓN]` **Costo ausente ≠ G. 0.** Si una variante no tiene costo, su margen es **información insuficiente**, nunca 0% ni 100%.

`[REGLA DERIVADA]` Todo agregado de margen declara su **cobertura**: *calculado sobre N de M líneas; M−N sin costo cargado*. Nunca se excluyen silenciosamente las líneas sin costo.

`[REGLA DERIVADA]` El cálculo debe poder abrirse: qué compras formaron el promedio, en qué orden, y con qué costo salió cada venta.

### 3.9 Evidencia y comprobantes en P2-A

`[DECISIÓN]` En P2-A la evidencia **nace en la operación**: se adjunta o referencia **desde** la venta, el cobro, la compra, el gasto, el aporte, el retiro o el reembolso.

`[DECISIÓN]` **El comprobante es evidencia, no una segunda operación.** Adjuntarlo nunca crea un ingreso, un egreso ni un movimiento.

#### Desambiguación obligatoria — cierre de CF-12

`[DECISIÓN]` **MP-046.** El Master Plan usa la expresión *"pendiente de vincular"* para **dos estados opuestos**. Se separan definitivamente:

| Nombre Qué es Dónde vive     |                                                                  |                                                 |
| ---------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| **Evidencia pendiente**      | una **operación** registrada que todavía espera su comprobante   | **P2-A** — atributo de la operación, no entidad |
| **Comprobante sin vincular** | un **comprobante** cargado suelto que todavía no tiene operación | **P2-B** — sólo existe con el centro organizado |

`[DECISIÓN]` En P2-A **no existe punto de entrada para cargar un comprobante huérfano.** Por lo tanto Q-10 no bloquea P2-A.

#### Tipo documental — cierre de Q-19

`[DECISIÓN]` **MP-045.** En P2-A **no se le pide tipo documental al usuario.** El tipo se **deriva del punto de vinculación** (evidencia de venta, evidencia de cobro, factura externa referenciada, comprobante de pago de compra, etc.).

`[REGLA DERIVADA]` El campo existe en el modelo desde P2-A para que el centro de P2-B pueda clasificar y filtrar **sin migración de datos**. Se completa automáticamente; queda editable recién en P2-B.

`[DECISIÓN]` Factura externa: número/referencia y/o archivo. ARKAN **no emite, no firma, no transmite**.

### 3.10 Cobros

`[DECISIÓN]` Venta pendiente o parcial genera **saldo del cliente**. Cobros posteriores y **parciales** son requisito de P2-A.

`[DECISIÓN]` Cada cobro conserva: fecha, monto, método de pago, actor, vínculo a venta y a cliente.

#### Vencimiento — cierre de Q-07

`[DECISIÓN]` **MP-040.** El vencimiento es **opcional** por venta pendiente. Si no se declara, la antigüedad se mide desde la **fecha del hecho de la venta**. No se inventa un vencimiento por defecto ni se obliga a declararlo (D19).

`[DECISIÓN]` **MP-053.** Semántica obligatoria:

- con vencimiento declarado y fecha superada → puede mostrarse **saldo vencido**;
- sin vencimiento declarado → nunca se presume vencido; se expresa como **saldo pendiente con antigüedad relevante desde la fecha de venta**.

`[REGLA DERIVADA]` A2 puede activarse por cualquiera de los dos caminos anteriores, siempre junto con saldo relevante, pero la interfaz y el historial deben conservar esta diferencia semántica.

### 3.11 Compras y pago a proveedores

`[DECISIÓN]` Compra en estado **PENDIENTE** o **PAGADA**. El pago es un **evento independiente**. **Sin pagos parciales a proveedores** en P2.

`[DECISIÓN]` **MP-049.** Semántica obligatoria de compra/pago:

- una compra creada como **PAGADA** confirma atómicamente la compra + exactamente un **PagoCompra** por el total + su movimiento de **Posición registrada**;
- una compra creada como **PENDIENTE** afecta inventario/costo e historial, pero **no** crea PagoCompra y **no** afecta Posición registrada;
- el pago posterior de una compra PENDIENTE cancela **todo el saldo pendiente** en P2-A, crea un PagoCompra por ese total, crea su movimiento de Posición y deja la compra PAGADA;
- **no existen pagos parciales a proveedores** en P2-A.

`[DECISIÓN]` Efectos: la compra afecta **inventario**; el **PagoCompra** afecta **Posición registrada**; el **costo de mercadería vendida** afecta resultado, no la compra en sí.

#### Proveedor — cierre de Q-08

`[DECISIÓN]` **MP-041.** El proveedor se registra como **texto libre en la compra**. **No es entidad** en P2. Sin cuentas por pagar.

`[REGLA DERIVADA]` El texto libre se guarda normalizado (trim + comparación insensible a mayúsculas) para poder sugerir proveedores ya usados sin crear entidad.

### 3.12 Gastos, aportes y retiros

`[DECISIÓN]` Gasto: fecha, categoría, monto, descripción, método de pago. Registro simple.

`[DECISIÓN]` `APORTE_DUENO` y `RETIRO_DUENO` afectan **Posición registrada** y **nunca** Business Health como presión de gastos ni como crecimiento de ingresos. Son visibles y trazables, separados del resultado del negocio.

### 3.13 Posición registrada

`[DECISIÓN]` **No se llama Caja.**

```
saldo inicial declarado
+ entradas registradas
− salidas registradas
= Posición registrada

```

`[DECISIÓN]` Es una **vista derivada**. No implica arqueo, conciliación ni saldo bancario real. La interfaz **declara su limitación**: *esto es lo que registraste, no necesariamente lo que tenés*.

#### Lista cerrada de movimientos — cierre de Q-09

`[DECISIÓN]` **MP-042.** En P2-A la lista es **cerrada**:

| Entradas Salidas                  |                          |
| --------------------------------- | ------------------------ |
| cobro de venta al contado         | gasto                    |
| cobro posterior (total o parcial) | pago de compra           |
| aporte del dueño                  | reembolso por devolución |
|                                   | retiro del dueño         |

`[DECISIÓN]` **Cualquier tipo de movimiento nuevo requiere decisión explícita registrada.** No se agrega uno durante la construcción.

`[REGLA DERIVADA]` Cada movimiento conserva **método de pago** y **operación de origen**. La Posición debe poder reconstruirse íntegramente desde sus movimientos, sin descuadre.

---

## 4. Mapa de propagación — contrato de eventos

> Un hecho se registra una vez y propaga (D9). La propagación completa es la ventaja del producto (D17). Toda conexión conserva origen y trazabilidad (D10).

| Evento Efectos obligatorios  |                                                                                                                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Venta confirmada**         | Inventario ↓ por variante · Cliente (historial, total, última compra) · Cobro o saldo pendiente · Posición registrada ↑ si hubo cobro efectivo · Métricas (brutas, netas, margen si hay costo) · Asuntos posibles · Historial |
| **Cobro posterior**          | Saldo de la venta ↓ · Saldo del cliente ↓ · Posición registrada ↑ · Métricas de cobranza · Asunto de cobro atrasado puede resolverse · Historial                                                                              |
| **Compra**                   | Inventario ↑ · Costo vigente recalculado · PENDIENTE → sin PagoCompra/Posición · PAGADA → exactamente un PagoCompra total + Posición ↓ en la misma operación · Historial                                                     |
| **PagoCompra posterior**     | Por el saldo pendiente total · Posición registrada ↓ · Compra → PAGADA · Historial                                                                                                                                                                           |
| **Gasto**                    | Posición registrada ↓ · Categoría · Contexto financiero · Historial                                                                                                                                                           |
| **Ajuste de inventario**     | Stock · Movimiento con motivo obligatorio · Actor · Historial                                                                                                                                                                 |
| **Devolución**               | Evento correctivo del período actual · Netas ↓ · vendible → Inventario ↑ al costo snapshot · no vendible → Merma · reduce saldo pendiente primero; sólo dinero efectivamente devuelto genera Reembolso · Cliente · Historial    |
| **Reembolso**                | Monto + fecha + método real · vínculo a devolución y venta original · Posición registrada ↓ · Historial                                                                                                                        |
| **`ERROR_DE_CARGA`**         | Venta anulada con motivo · revierte inventario · **excluida** de brutas y netas · sin efecto en Posición · visible permanentemente en historial                                                                               |
| **Aporte / Retiro**          | Posición registrada ↑/↓ · Historial · **nunca** ingreso comercial ni gasto operativo ni Business Health                                                                                                                       |
| **Evidencia vinculada**      | Se adjunta a una operación existente · **no** crea operación · **no** duplica dinero · **no** altera Posición                                                                                                                 |
| **Stock alcanza el mínimo**  | Asunto ATENCIÓN con explicación y seguimiento hasta que entre stock                                                                                                                                                           |
| **Asunto resuelto**          | Nueva evidencia → estado resuelto → la alerta desaparece → la recuperación es visible                                                                                                                                         |

`[REGLA DERIVADA]` **Atomicidad.** Una operación y todas sus consecuencias se confirman o fallan juntas. Nunca puede quedar una venta registrada sin su movimiento de inventario, ni un cobro sin su movimiento de Posición.

`[REGLA DERIVADA]` **Todo efecto guarda la operación de origen.** Ningún movimiento derivado puede existir huérfano.

---

## 5. Invariantes verificables

> Se implementan como chequeos ejecutables sobre el set de datos de prueba. Si alguno falla, P2-A no está listo.

1. `stock(variante) = Σ movimientos(variante)` — siempre, sin caché divergente.
2. `Posición registrada = saldo inicial + Σ movimientos de Posición` — sin descuadre.
3. `Σ(subtotal_i − descuento_i) = total de la venta` — para toda venta con descuento global.
4. `saldo(venta) = total − Σ cobros(venta) − reducciones por devolución` — nunca negativo.
5. `saldo(cliente) = Σ saldos de sus ventas` — reconciliable venta por venta.
6. `netas = brutas − correcciones económicas del período` — las tres cifras cuadran.
7. Ninguna venta `anulada_por_error` aparece en brutas ni en netas.
8. Ninguna línea de venta tiene `costo_al_momento` modificado después de su creación.
9. Todo movimiento derivado tiene operación de origen no nula.
10. Toda cifra mostrada en INICIO puede abrirse hasta las operaciones que la componen.
11. Adjuntar evidencia no altera ninguna de las cifras anteriores.
12. Ningún margen se calcula sobre costo ausente tratado como 0.
13. Una variante **nunca** tiene A1 y A4 abiertos simultáneamente.
14. Toda compra **PAGADA** tiene exactamente un `PagoCompra` por el total; ninguna compra **PENDIENTE** tiene `PagoCompra`.
15. Todo `PagoCompra` tiene su movimiento de **Posición registrada**; ninguna compra PENDIENTE afecta Posición registrada.
16. Todo **Reembolso** conserva monto, fecha, método de pago, devolución de origen y venta original, y tiene su movimiento de Posición registrada.
17. Una devolución que sólo reduce saldo pendiente **no** genera Reembolso, movimiento de Posición registrada ni método de pago.
18. Ningún A2 usa la semántica **vencido** si la venta no tiene vencimiento declarado.

---

## 6. Asuntos en P2-A

`[DECISIÓN]` **Un único objeto transversal: Asunto.** Clases: **PROGRESO · OPORTUNIDAD · ATENCIÓN · CRÍTICO**. La recomendación es un **campo** del Asunto, no otra entidad.

`[DECISIÓN]` Estructura obligatoria: clase · detección · evidencia · explicación · recomendación (opcional) · estado · seguimiento.

`[DECISIÓN]` **No se crean Asuntos para aumentar engagement.** El silencio es el estado normal (D12).

### 6.1 Nombre y ubicación — cierre de Q-11 / CF-03

`[DECISIÓN]` **MP-043.** La entidad se llama **Asunto**. **No existe módulo "Pendientes"** en la arquitectura aprobada: los Asuntos relevantes viven dentro de **INICIO**, y la lista completa es profundidad dentro de INICIO, no una entrada de navegación. **CF-03 queda resuelto.**

### 6.2 Reglas de detección permitidas en P2-A

`[DECISIÓN]` Sólo estas cinco. Toda regla nace de datos existentes, no de inferencia estadística.

| ID Regla Clase Se cierra cuando  |                                                                                                                                    |                                  |                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------- |
| **A1**                           | `stock(variante) ≥ 0` y `stock(variante) ≤ stock_mínimo` y mínimo > 0                                                              | ATENCIÓN                         | stock supera el mínimo                      |
| **A2**                           | Venta pendiente/parcial con saldo > 0 y saldo relevante + (vencimiento declarado superado, o antigüedad relevante sin vencimiento) | ATENCIÓN → CRÍTICO según impacto | el saldo llega a 0                          |
| **A3**                           | Operación marcada como **Evidencia pendiente**                                                                                     | ATENCIÓN pasiva (no interrumpe)  | se vincula la evidencia                     |
| **A4**                           | `stock(variante) < 0`                                                                                                              | ATENCIÓN                         | entra una compra o un ajuste que lo corrige |
| **A5**                           | Variante vendida **sin costo cargado** (impide margen)                                                                             | ATENCIÓN pasiva                  | se carga el costo                           |

`[DECISIÓN]` **MP-052.** A4 tiene precedencia sobre A1: si `stock(variante) < 0`, sólo puede estar abierto **A4**; A1 exige stock ≥ 0. Una variante nunca muestra A1 y A4 a la vez.

`[DECISIÓN]` A2 **nunca** dispara por antigüedad sola sin importe relevante.

`[DECISIÓN]` **MP-053.** Si A2 nace de un vencimiento declarado superado puede usar **saldo vencido**. Si no existe vencimiento declarado, debe usar **saldo pendiente con antigüedad relevante desde la fecha de venta** y nunca presentarlo como vencido.

`[PARÁMETRO DE PILOTO]` Umbral de atraso por defecto sin vencimiento declarado, y umbral de "saldo relevante" de A2. Son parámetros configurables; **no son doctrina** y se calibran con datos reales del piloto.

`[FUERA DE P2-A]` Asunto por **ajuste recurrente**: requiere definir qué es "recurrente" y ese umbral no existe. No se inventa (MP 5.5 lo deja como potencial).

### 6.3 Presupuesto de atención — cierre de Q-14

`[DECISIÓN]` **MP-044.** Derecho a interrumpir en INICIO:

- **PROGRESO** nunca interrumpe;
- **OPORTUNIDAD** no se genera en P2-A (no hay regla que la produzca honestamente todavía);
- **ATENCIÓN pasiva** (A3, A5) aparece en lista, **no** en el bloque de asuntos relevantes;
- **ATENCIÓN activa** (A1, A2, A4) y **CRÍTICO** compiten por el bloque de asuntos relevantes.

`[PARÁMETRO DE PILOTO]` **Máximo 3** asuntos con derecho a interrumpir simultáneamente en INICIO, ordenados por impacto empresarial; el resto es accesible en la lista completa. El número es parámetro de piloto, **no doctrina**.

`[DECISIÓN]` **El rojo pertenece exclusivamente a gravedad empresarial real.** Nunca a un problema técnico, nunca para vender un plan.

---

## 7. Business Health y Connection Status en P2-A

### 7.1 Business Health

`[DECISIÓN]` En P2-A Business Health **muestra siempre ⚪ Información insuficiente**. **No hay puntuación, no hay fórmula, no hay estado por dimensión calculado ni almacenado.**

`[DECISIÓN]` Lo que sí muestra: **qué información falta**, expresada como cobertura.

`[REGLA DERIVADA]` Checklist de cobertura de P2-A, alineado con la progresión de onboarding (MP 6.5) — presencia de datos, no umbrales:

Empresa (saldo inicial declarado) → Productos (catálogo con al menos una variante) → Costos cargados → Inventario (al menos una entrada) → Ventas registradas → Clientes → Cobros → Gastos.

#### Copy prohibido — cierre de CF-13

`[DECISIÓN]` **MP-047.** Está **prohibido** el copy *"ARKAN está aprendiendo de tu negocio"* y toda variante de lenguaje de aprendizaje, vigilancia o apropiación de información (MP 4.20 y 6.5).

`[DECISIÓN]` El copy habla de **lo que falta**, no de lo que ARKAN hace con los datos. Dirección aprobada, no copy final:

> Todavía no tenemos suficiente información para evaluar esta área. Falta: costos de 12 variantes.

`[REGLA DERIVADA]` `ARKAN_DESIGN_SYSTEM.md` contiene hoy el copy prohibido y **debe corregirse** (ver Anexo A).

### 7.2 Connection Status

`[DECISIÓN]` **Separación absoluta** entre Business Health (estado empresarial) y Connection Status (estado técnico / de datos).

| Estados           |                                                                                  |
| ----------------- | -------------------------------------------------------------------------------- |
| Business Health   | 🟢 Saludable · 🟡 Atención · 🔴 Crítico · ⚪ Información insuficiente             |
| Connection Status | 🟢 ARKAN conectado · ○ Sin conexión · Configuración incompleta · Esperando datos |

`[DECISIÓN]` Un problema técnico **jamás** se pinta de rojo empresarial.

---

## 8. Accesos en P2-A

### 8.1 Matriz mínima (default, sin abrir Q-16)

`[DECISIÓN]` Se implementa **solamente el default ya decidido**. La matriz RBAC granular queda `[ABIERTO]` (Q-16) y **no bloquea P2-A**.

| Capacidad Dueño Contador (default)               |   |                              |
| ------------------------------------------------ | - | ---------------------------- |
| Ver ventas, cobros, gastos, compras/costos       | ✅ | ✅ lectura                    |
| Exportar lo anterior                             | ❌ (P2-B) | ❌ (P2-B)              |
| Ver copias de documentos permitidos              | ✅ | ✅ lectura                    |
| Registrar/editar ventas, cobros, compras, gastos | ✅ | ❌                            |
| Editar catálogo                                  | ✅ | ❌                            |
| Ver/editar usuarios y configuración              | ✅ | ❌                            |
| Ver Business Health y Asuntos                    | ✅ | ❌ (no es su responsabilidad) |
| Invitar/revocar contador                         | ✅ | ❌                            |

`[DECISIÓN]` **MP-051.** En P2-A el contador tiene **lectura** de la información permitida, **no edita**, no consume asiento, su actividad es trazable y visible, y el dueño puede revocar el acceso. La **exportación** se mueve a P2-B; no se implementa como capacidad del contador en P2-A. Toda ampliación de permisos debe ser **explícita y visible** — y en P2-A **no existe mecanismo de ampliación**, porque su diseño depende de Q-16.

`[DECISIÓN]` Señal UX contextual: **● Contador conectado**.

---

## 9. Reglas de pantalla no negociables

`[DECISIÓN]` Aplican a toda la construcción de P2-A:

1. **Fast Capture.** El camino por defecto de la venta es el más corto posible. Todo campo opcional está fuera de él.
2. **Nada que ARKAN pueda derivar se le pide al usuario.**
3. **La evidencia nunca es un paso obligatorio.**
4. **La confirmación no bloquea.** Tras confirmar, se puede iniciar la siguiente venta inmediatamente.
5. **Consecuencia visible, breve y no bloqueante.** Ej. conceptual: *Venta registrada. Stock actualizado. Cobro actualizado.* El detalle se abre sólo si el usuario quiere.
6. **La confirmación explica consecuencias reales; no felicita.**
7. **Una acción primaria clara por pantalla.** Tranquilidad antes que densidad.
8. **Cards e indicadores explican, no decoran.** Ninguna cifra sin origen abrible.
9. **Ninguna entidad del modelo tiene derecho automático a una entrada de navegación** (D18).
10. **Sin gamificación**: nada de medallas, puntos, rachas, recompensas.
11. **Las animaciones representan eventos reales.** Nada de movimiento decorativo permanente.
12. **Voz:** clara, paraguaya, voseo, profesional. *"Esto todavía no lo sabemos"* antes que falsa precisión.

`[DECISIÓN]` **Regla de desempate ante un campo dudoso**, en orden: ¿tiene consecuencia empresarial real? → ¿ARKAN puede derivarlo? → ¿es necesario para la integridad del dato? → si sólo es "útil por las dudas", **queda fuera del camino principal o no existe**.

---

## 10. Datos de prueba obligatorios

`[DECISIÓN]` P2-A incluye un set de datos coherente de **una tienda de ropa** que ejercite **todos** los casos, incluidos los correctivos:

- catálogo con **al menos 8 productos** y sus variantes talle × color, incluyendo **una variante sin costo cargado** (para ejercitar A5 y cobertura de margen);
- **compras del mismo producto a distinto costo** en fechas distintas (ejercita promedio ponderado móvil y explicabilidad);
- ventas **al contado, parciales y pendientes**, con y sin cliente;
- venta con **descuento de línea** y venta con **descuento global** que produzca residuo de redondeo;
- **cobro parcial** y cobro posterior que cierra un saldo;
- **devolución vendible** y **devolución no vendible → merma**;
- **merma directa** por rotura (fuera de devolución);
- **`ERROR_DE_CARGA`** válido y un caso que **no** cumple condiciones (debe rechazarse);
- **aporte** y **retiro** del dueño;
- gastos de al menos tres categorías;
- **una variante bajo el mínimo** (A1) y **una variante en negativo** (A4);
- **una operación con Evidencia pendiente** (A3) y una con evidencia vinculada;
- compra **PENDIENTE** y compra **PAGADA**.

`[DECISIÓN]` Los datos de prueba son **evidencia de correctitud**, no decorado de demo.

---

## 11. Criterios de aceptación de P2-A

> Derivados de MP 13.5, filtrados a lo que P2-A debe demostrar. **Todos deben cumplirse.**

**Correctitud del dominio**

1. Una venta confirmada propaga a inventario, cliente, cobro/saldo, Posición registrada, métricas e historial, sin doble carga.
2. Devolución, merma y `ERROR_DE_CARGA` producen exactamente los efectos definidos en 3.6, 3.7 y 3.8 — verificados caso por caso.
3. Brutas, correcciones y netas son consistentes y reconciliables.
4. Compra y pago de compra afectan lo que deben y sólo lo que deben.
5. Aporte y retiro afectan Posición registrada y **no** afectan Business Health.
6. La Posición registrada reconstruye su saldo desde sus movimientos, sin descuadre.
7. Los **18 invariantes** de la sección 5 pasan sobre el set de datos de prueba.

**Trazabilidad** 8. Toda cifra del INICIO se abre hasta las operaciones que la componen. 9. Todo movimiento responde qué, cuándo, quién, desde dónde y qué cambió. 10. Ninguna corrección borró historia. 11. El Libro de Hechos contextual funciona en producto/variante, cliente, venta y Posición registrada **leyendo la misma fuente de hechos**, sin datos duplicados.

**Conexiones y evidencia** 12. Una venta produce **todas** las conexiones correctas sin cargas duplicadas. 13. Una factura o comprobante se rastrea hasta la operación a la que pertenece. 14. **Ninguna operación se duplica al adjuntar evidencia.** 15. Ninguna evidencia obligatoria frena una venta habitual.

**Experiencia** 16. Registrar una venta típica toma **menos pasos** que el método actual del comercio. 17. Todo paso del flujo habitual tiene una razón empresarial real. 18. Después de confirmar, el usuario puede iniciar la siguiente venta **inmediatamente**. 19. La navegación expone **5 áreas operativas** y no más; ninguna entidad interna ganó entrada propia. 20. Cada registro muestra su consecuencia real de forma comprensible. 21. El onboarding se percibe como **conectar el negocio**, no configurar software.

**Honestidad** 22. Business Health muestra ⚪ con explicación de qué falta, **sin** puntuación y **sin** el copy prohibido (MP-047). 23. Ningún margen se calcula sobre costo ausente; todo margen se explica hasta las compras que formaron el promedio. 24. Todo Asunto mostrado tiene detección, evidencia, explicación y, si corresponde, recomendación y seguimiento. 25. Ningún asunto de P2-A proviene de inferencia: los cinco son reglas verificables.

**Accesos** 26. El contador lee lo permitido, no edita, no consume asiento, es revocable y su actividad es visible. La exportación queda en **P2-B**.

**Datos** 27. Existe el set de datos de prueba de la sección 10 y ejercita todos los casos, incluidos los correctivos.

---

## 12. Fuera de alcance de P2-A

`[FUERA DE P2-A]` — sin excepción:

- **Fiscal:** SIFEN, DNIT, timbrado, firma digital, certificados, CSC, KuDE como emisión, XML fiscal, PSC, transmisión. ARKAN documenta, no emite.
- **P2-B:** centro organizado de Bancos y Comprobantes, comprobante huérfano, Calendar Lite, exportaciones refinadas del contador.
- **Producto:** ERP, contabilidad, POS multi-rubro, restaurantes, hardware, CRM, multi-sucursal, multi-moneda, desarrollo a medida.
- **Bancos:** integración automática, lectura de movimientos, open banking, conciliación, credenciales.
- **Inteligencia:** score con fórmula, salud numérica, estados por dimensión, rotación, días de cobertura, valorización, reposición sugerida, estacionalidad, predicciones, recordatorios inteligentes, IA autónoma.
- **Modelo:** saldo a favor / crédito interno, pagos parciales a proveedores, entidad proveedor, cuentas por pagar, lotes/FIFO.
- **Accesos:** rol vendedor, Sales Workspace, herramientas en contexto (calculadora de vuelto, etc.), mecanismo de ampliación de permisos del contador.
- **Experiencia:** gamificación, dashboard saturado, urgencia artificial, spam de fechas.

---

## 13. Preguntas parqueadas (no bloquean P2-A)

| ID Pregunta Categoría Qué **no** se puede hacer sin cerrarla  |                                                        |                       |                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------ | --------------------- | -------------------------------------------------- |
| Q-10                                                          | ¿Comprobante sin vincular genera Asunto?               | B — P2-B              | Construir el centro de comprobantes                |
| Q-12 / CF-04                                                  | ¿Estados internos por dimensión?                       | C — post-piloto       | Diseñar Business Health real                       |
| Q-15 / CF-06                                                  | Interaction Principles, bloque 6                       | C — sistema de diseño | Declarar cerrado el sistema de diseño              |
| Q-16                                                          | Matriz RBAC granular                                   | C — accesos           | Ampliar permisos del contador más allá del default |
| Q-17                                                          | ¿El contador ve comprobantes bancarios?                | B — P2-B              | Definir visibilidad en el centro de P2-B           |
| CF-11                                                         | Tensión D19 vs. cliente obligatorio en venta a crédito | D — medición          | Nada. Se **mide** en el piloto                     |
| —                                                             | Nombre definitivo de Business Health                   | C                     | Copy final del indicador                           |
| —                                                             | Pricing                                                | D                     | Fuera del alcance documental                       |

`[DECISIÓN]` **Ninguna de estas impide construir P2-A.** No se inventa ninguna durante la construcción: si aparece la necesidad, **se detiene y se consulta**.

---

## 14. Registro de decisiones de este brief

| ID Decisión Sección Origen  |                                                                                                                                                                                                                                                                   |      |                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------ |
| MP-034                      | Arquitectura de navegación P2-A: 5 áreas (INICIO · VENDER · CATÁLOGO · CLIENTES · DINERO) + Configuración/Contador/Negocio fuera de la navegación operativa. Libro de Hechos como componente reutilizable contextual con fuente única. Cierra **Q-18** para P2-A. | 2    | Decisión del dueño |
| MP-035                      | Guaraní, montos enteros; reparto proporcional con residuo en prorrateo. Cierra **Q-01**.                                                                                                                                                                          | 3.1  | Brief              |
| MP-036                      | Generación asistida de matriz talles × colores, variantes activas con stock 0. Cierra **Q-02**.                                                                                                                                                                   | 3.3  | Brief              |
| MP-037                      | Stock negativo permitido con advertencia explícita y Asunto A4; la venta no se bloquea. Cierra **Q-04**.                                                                                                                                                          | 3.4  | Brief              |
| MP-038                      | Vendible/no vendible obligatorio; motivo obligatorio sólo en no vendible. Cierra **Q-05**.                                                                                                                                                                        | 3.6  | Brief              |
| MP-039                      | `MERMA` como movimiento propio, también fuera de devolución, con motivo obligatorio. Cierra **Q-06**.                                                                                                                                                             | 3.8  | Brief              |
| MP-040                      | Vencimiento opcional; sin él, el atraso se mide desde la fecha de la venta. Cierra **Q-07**.                                                                                                                                                                      | 3.10 | Brief              |
| MP-041                      | Proveedor como texto libre normalizado, no entidad. Cierra **Q-08**.                                                                                                                                                                                              | 3.11 | Brief              |
| MP-042                      | Lista cerrada de movimientos de Posición registrada. Cierra **Q-09**.                                                                                                                                                                                             | 3.13 | Brief              |
| MP-043                      | La entidad es **Asunto**; no existe módulo "Pendientes"; vive dentro de INICIO. Cierra **Q-11** y **CF-03**.                                                                                                                                                      | 6.1  | MP-034             |
| MP-044                      | Derecho a interrumpir por clase + tope de 3 asuntos como `[PARÁMETRO DE PILOTO]`. Cierra **Q-14**.                                                                                                                                                                | 6.3  | Brief              |
| MP-045                      | Tipo documental derivado del punto de vinculación, no pedido al usuario. Cierra **Q-19**.                                                                                                                                                                         | 3.9  | Brief              |
| MP-046                      | Desambiguación **Evidencia pendiente** (P2-A) vs **Comprobante sin vincular** (P2-B). Cierra **CF-12** y difiere **Q-10** a P2-B.                                                                                                                                 | 3.9  | Brief              |
| MP-047                      | Prohibido el copy de aprendizaje/vigilancia en cobertura insuficiente. Cierra **CF-13**.                                                                                                                                                                          | 7.1  | MP 4.20            |
| MP-048                      | VENDER incluye el historial de ventas como segunda profundidad; no agrega entrada de navegación.                                                                                                                                                                  | 2.2  | MP-034             |
| MP-049                      | Compra PAGADA crea atómicamente exactamente un PagoCompra total + movimiento de Posición; PENDIENTE no crea pago ni afecta Posición; pago posterior liquida el saldo completo.                                                                                  | 3.11 | Brief              |
| MP-050                      | Reembolso es entidad explícita con monto, fecha, método real, devolución y venta original; una reducción de saldo sin devolución de dinero no crea Reembolso ni Posición.                                                                                       | 3.6  | Brief              |
| MP-051                      | Contador en P2-A: lectura, sin edición, trazable y revocable; exportación pasa a P2-B.                                                                                                                                                                             | 8.1  | Brief              |
| MP-052                      | A4 (`stock < 0`) tiene precedencia sobre A1; A1 exige `stock ≥ 0`; nunca ambos abiertos simultáneamente.                                                                                                                                                           | 6.2  | Brief              |
| MP-053                      | Sólo existe “saldo vencido” con vencimiento declarado superado; sin vencimiento se usa “saldo pendiente con antigüedad relevante desde la fecha de venta”.                                                                                                     | 3.10 / 6.2 | Brief          |

`[DECISIÓN]` MP-035 a MP-053 se cerraron **para desbloquear P2-A**. Todas son ratificables por el dueño en una línea y ninguna reabre la arquitectura ni la doctrina.

---

## 15. Handoff a construcción

`[DECISIÓN]` Orden sugerido, cada bloque con sus invariantes verdes antes de pasar al siguiente:

1. **Cimientos:** negocio, usuarios/accesos, convenciones transversales, **evento de historial** (el Libro de Hechos se construye primero, no al final).
2. **Catálogo:** productos, variantes, matriz asistida, carga rápida/masiva.
3. **Inventario:** movimientos, stock derivado, mínimos, ajustes, merma, costeo promedio ponderado.
4. **Compras:** compra, líneas, estado, pago como evento.
5. **Ventas:** flujo Fast Capture, líneas, descuentos, snapshot de costo, estados de cobro.
6. **Clientes y cobros:** saldos, cobros totales y parciales.
7. **Correcciones:** devolución, merma desde devolución, `ERROR_DE_CARGA`.
8. **Dinero:** gastos, aporte/retiro, Posición registrada.
9. **Evidencia:** vinculación desde la operación, Evidencia pendiente.
10. **Asuntos:** las cinco reglas, presupuesto de atención.
11. **INICIO:** dashboard, asuntos relevantes, actividad reciente, cifras abribles.
12. **Business Health ⚪** con checklist de cobertura y copy correcto.
13. **Contador:** acceso, lectura, exportación, revocación, actividad visible.
14. **Datos de prueba** + corrida completa de invariantes y criterios de aceptación.

`[DECISIÓN]` **Regla de construcción:** si el equipo necesita una regla de dominio que no está en este brief, **no la inventa**. Se detiene, se registra la pregunta y se consulta.

---

## Anexo A — Reconciliación de documentos dueños

> `ARKAN_RECOVERY_AUDIT.md` **no se modifica**: es registro histórico de recuperación y su terminología antigua (por ejemplo "Caja") se conserva como testimonio, no como norma vigente.

| Documento Cambio requerido Motivo  |                                                                                                                                                                                                                                                                    |                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `CLAUDE.md`                        | Regla 9: precisar *"un solo indicador global; en P2-A no se calcula ni almacena estado por dimensión"*. Agregar regla de precedencia del Master Plan FROZEN.                                                                                                       | CF-04 sigue abierta (Q-12); P2-A necesita un guardrail sin resolverla |
| `ARKAN_PROJECT_STATE.md`           | Reemplazar la lista de 10 módulos por **alcance del dominio** + **arquitectura de navegación de 5 áreas**. Agregar Compras, Posición registrada, correcciones y evidencia al alcance. Actualizar bloqueadores: quedan repositorio y landing. Actualizar hito P2-A. | CF-07, CF-08, MP-034                                                  |
| `ARKAN_INDEX.md`                   | Agregar dueños: Master Plan (fuente conceptual), este brief (contrato de construcción), Recovery Audit (histórico, no normativo). Unificar rutas (`project/`, `docs/`) con la estructura real.                                                                     | El índice no refleja los documentos vigentes                          |
| `ARKAN_CONTROL_PRODUCT.md`         | Reescribir la navegación de 10 módulos a las 5 áreas. Reemplazar **Caja → Posición registrada**. Incorporar compras, correcciones, merma, aporte/retiro, evidencia. Renombrar *Pendientes / Inteligencia* → **Asuntos** dentro de INICIO.                          | CF-02, CF-03, CF-07, CF-08, MP-034                                    |
| `ARKAN_DESIGN_SYSTEM.md`           | **Eliminar** el copy *"ARKAN está aprendiendo de tu negocio"* y reemplazarlo por lenguaje de cobertura. Agregar reglas de pantalla de la sección 9. Agregar separación Business Health / Connection Status.                                                        | **CF-13** (nuevo), MP-047, MP-017                                     |
| `ARKAN_DATA_CONNECTIONS.md`        | Reemplazar **Caja → Posición registrada**. Incorporar el mapa de propagación de la sección 4 (correcciones, error de carga, aporte/retiro, evidencia).                                                                                                             | CF-02, D17                                                            |
| `ARKAN_INHERITANCE_MAP.md`         | Sin cambios de fondo. Opcional: registrar que *Gestio Score → Business Health* ya tiene estados y default ⚪ definidos.                                                                                                                                             | Coherencia                                                            |
| `ARKAN_LANDING_BRIEF.md`           | Sin cambios en P2-A. Nota: el copy no puede prometer velocidad ni tiempo ahorrado hasta medirlo (MP-028, MP-033).                                                                                                                                                  | Honestidad comercial                                                  |
| `ARKAN_RECOVERY_AUDIT.md`          | **Sin cambios.**                                                                                                                                                                                                                                                   | Instrucción explícita                                                 |
| Master Plan                        | Normalizar nombre de archivo a `ARKAN_CONTROL_MASTER_PLAN_v1.0.md` y marcarlo **APPROVED / FROZEN**. Evitar que convivan variantes del mismo archivo.                                                                                                              | **CF-14** (nuevo, documental)                                         |

`[DECISIÓN]` Los archivos del Project Knowledge son copias de sólo lectura. **Esta reconciliación es la especificación de cambios**; debe aplicarse en el proyecto/repositorio por el dueño antes de considerarse cerrada (MP-022).

---

## Anexo B — Conflictos: estado

| ID Estado  |                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| CF-01      | **RESUELTO** — promedio ponderado móvil + snapshot (MP-032)                                             |
| CF-02      | **RESUELTO en decisión, pendiente de bajar a documentos** — Posición registrada                         |
| CF-03      | **RESUELTO** — entidad Asunto, sin módulo Pendientes (MP-043)                                           |
| CF-04      | **ABIERTO** → Q-12. No bloquea P2-A: no se calcula estado por dimensión                                 |
| CF-05      | **RECONOCIDO** — el dashboard de P1 no es reconstruible; P2 es diseño nuevo                             |
| CF-06      | **ABIERTO** → Q-15. No se inventa                                                                       |
| CF-07      | **RESUELTO en decisión, pendiente de bajar a documentos** — dominio ≠ navegación                        |
| CF-08      | **RESUELTO en decisión, pendiente de bajar a documentos** — compra explícita                            |
| CF-09      | **RESUELTO** — propuesta retirada; arquitectura de 5 áreas aprobada                                     |
| CF-10      | **RESUELTO** — MP-015 enmendado por MP-030: adjuntar (P2-A) / organizar (P2-B)                          |
| CF-11      | **NO ES CONTRADICCIÓN** — se mide en el piloto (proporción contado vs. crédito)                         |
| **CF-12**  | **NUEVO — RESUELTO** — *Evidencia pendiente* (P2-A) ≠ *Comprobante sin vincular* (P2-B) (MP-046)        |
| **CF-13**  | **NUEVO — RESUELTO** — copy de aprendizaje prohibido; `ARKAN_DESIGN_SYSTEM.md` debe corregirse (MP-047) |
| **CF-14**  | **NUEVO — DOCUMENTAL** — normalizar el nombre y el estado FROZEN del archivo del Master Plan            |

---

## Anexo C — Mediciones obligatorias del piloto

`[DECISIÓN]` Sobre la venta: tiempo real de registro · número de interacciones · pasos donde el usuario duda o se detiene · campos eliminables o derivables · diferencia frente al proceso anterior del negocio · frecuencia de uso de campos opcionales · proporción contado vs. pendiente/parcial (CF-11).

`[DECISIÓN]` Sobre la atención: **toda alerta mostrada durante el piloto se audita**. Si no justificó una decisión, gastó atención indebidamente (D12).

`[DECISIÓN]` **Ningún resultado se convierte en claim comercial hasta medirse en negocios reales** (MP-028, MP-033). **No se fija ningún umbral de segundos.**

---

> La complejidad existe detrás de ARKAN, nunca delante del usuario.
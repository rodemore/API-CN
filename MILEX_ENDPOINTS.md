# 🏥 Ruleta Milex - Documentación de API

## Tabla de Contenidos
- [Información General](#información-general)
- [Premios Disponibles](#premios-disponibles)
- [Configuración](#configuración)
- [Endpoints](#endpoints)
  - [POST /api/milex/spin](#post-apimilexspin)
  - [POST /api/milex/winner](#post-apimilexwinner)
  - [GET /api/milex/stats](#get-apimilexstats)
  - [GET /api/milex/winners/download](#get-apimilexwinnersdownload)
- [Flujo de Uso](#flujo-de-uso)
- [Códigos de Error](#códigos-de-error)

---

## Información General

**Ruleta Milex** es un sistema de premios virtual con probabilidad configurable y selección ponderada por stock.

- **ID de Ruleta:** `6`
- **Probabilidad de Ganar:** 60% (configurable mediante `MILEX_PROBABILITY`)
- **Total de Premios:** 9 tipos diferentes
- **Stock Total Inicial:** 1,228 premios
- **Algoritmo de Selección:** Probabilidad ponderada por stock disponible

### Características Clave

✅ **Probabilidad Ponderada por Stock:** Los premios con mayor stock disponible tienen mayor probabilidad de ser seleccionados cuando el usuario gana. Esto asegura una distribución equilibrada de premios.

✅ **Gestión de Inventario:** El sistema rastrea ganadores sin decrementar stock directamente, manteniendo un audit trail completo.

✅ **Separación de Datos:** Todos los datos están aislados usando `ID_RULETA: 6` para evitar conflictos con otras ruletas.

---

## Premios Disponibles

| ID Premio | Nombre del Premio | Stock Inicial | Categoría |
|-----------|-------------------|---------------|-----------|
| **201** | 300 puntos | 450 | Puntos Bajos |
| **202** | 500 puntos | 450 | Puntos Bajos |
| **203** | 1000 puntos | 110 | Puntos Medios |
| **204** | 2000 puntos | 110 | Puntos Medios |
| **205** | 5000 puntos | 50 | Puntos Altos |
| **206** | 10000 puntos | 30 | Puntos Premium |
| **207** | Sillas | 20 | Premio Físico |
| **208** | Televisores | 3 | Premio Físico Premium |
| **209** | Mesa | 5 | Premio Físico |

### Distribución de Stock

```
Puntos Bajos (300-500):    900 premios (73.3%)
Puntos Medios (1000-2000): 220 premios (17.9%)
Puntos Altos (5000+):       80 premios (6.5%)
Premios Físicos:            28 premios (2.3%)
─────────────────────────────────────────────
TOTAL:                    1,228 premios (100%)
```

### Probabilidad de Selección

La probabilidad de ganar cada premio **cuando el usuario gana** (después del 60% inicial) es proporcional al stock disponible:

- **300 puntos:** ~36.6% (450/1228)
- **500 puntos:** ~36.6% (450/1228)
- **1000 puntos:** ~9.0% (110/1228)
- **2000 puntos:** ~9.0% (110/1228)
- **5000 puntos:** ~4.1% (50/1228)
- **10000 puntos:** ~2.4% (30/1228)
- **Sillas:** ~1.6% (20/1228)
- **Televisores:** ~0.2% (3/1228)
- **Mesa:** ~0.4% (5/1228)

> **Nota:** Estas probabilidades se ajustan dinámicamente conforme se van otorgando premios, manteniendo siempre la proporción según el stock disponible.

---

## Configuración

### Variables de Entorno

Añadir al archivo `.env`:

```bash
# Probabilidad para Milex (ID_RULETA: 6) - 60% de probabilidad de ganar
MILEX_PROBABILITY=0.60
```

### Cargar Stock Inicial

```bash
# Cargar premios desde Files/ruletaMilex.xlsx a MongoDB
npm run load-milex
```

**Output esperado:**
```
✅ Conectado a MongoDB
📊 Leyendo 9 premios de Milex del Excel...
🗑️  Premios de Milex anteriores eliminados
⚠️  1 ID_PREMIO duplicado corregido
✅ Premio 201 - 300 puntos cargado (Stock: 450)
✅ Premio 202 - 500 puntos cargado (Stock: 450)
...
🎉 Stock de Milex cargado exitosamente!
📦 Total de premios de Milex en la base de datos: 9
```

---

## Endpoints

### POST /api/milex/spin

Simula un giro de la ruleta Milex con probabilidad del 60%.

#### Request

**URL:** `/api/milex/spin`
**Método:** `POST`
**Content-Type:** `application/json`

**Body:**
```json
{
  "roulette_id": 6
}
```

**Parámetros:**
- `roulette_id` (number, requerido): Debe ser `6` para la ruleta Milex

#### Response - Usuario No Gana (40% de probabilidad)

**Status:** `200 OK`

```json
{
  "success": true,
  "winner": false,
  "message": "No ganaste esta vez. ¡Sigue intentando!"
}
```

#### Response - Usuario Gana (60% de probabilidad)

**Status:** `200 OK`

```json
{
  "success": true,
  "winner": true,
  "message": "¡Felicidades! Has ganado un premio",
  "prize": {
    "id": 201,
    "name": "300 puntos",
    "roulette_id": 6,
    "remainingStock": 449
  }
}
```

**Campos del premio:**
- `id` (number): ID del premio ganado
- `name` (string): Nombre del premio
- `roulette_id` (number): ID de la ruleta (siempre 6)
- `remainingStock` (number): Stock disponible después de este premio

#### Response - Sin Stock Disponible

**Status:** `200 OK`

```json
{
  "success": true,
  "winner": false,
  "message": "Lo sentimos, no hay premios disponibles en este momento"
}
```

#### Response - Error de Validación

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "roulette_id is required"
}
```

#### Response - Error del Servidor

**Status:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Error al lanzar la ruleta Milex",
  "error": "Mensaje de error detallado"
}
```

#### Ejemplo de Uso con cURL

```bash
# Hacer un spin
curl -X POST http://localhost:3000/api/milex/spin \
  -H "Content-Type: application/json" \
  -d '{"roulette_id": 6}'
```

#### Ejemplo de Uso con JavaScript (fetch)

```javascript
const spin = async () => {
  const response = await fetch('http://localhost:3000/api/milex/spin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ roulette_id: 6 })
  });

  const result = await response.json();

  if (result.winner) {
    console.log(`¡Ganaste ${result.prize.name}!`);
  } else {
    console.log('No ganaste esta vez');
  }
};
```

---

### POST /api/milex/winner

Registra un ganador o participante en la base de datos.

> **Importante:** Este endpoint debe llamarse **después** de `/spin` para registrar el resultado y actualizar el stock.

#### Request

**URL:** `/api/milex/winner`
**Método:** `POST`
**Content-Type:** `application/json`

**Body:**
```json
{
  "user_id": "user_12345",
  "prize": "300 puntos",
  "prize_id": 201,
  "roulette_id": 6,
  "is_winner": true
}
```

**Parámetros:**
- `user_id` (string, requerido): ID único del usuario
- `prize` (string, requerido): Nombre del premio (o "Sin premio" si no ganó)
- `prize_id` (number/string, requerido): ID del premio (o "no_winner" si no ganó)
- `roulette_id` (number, requerido): Debe ser `6`
- `is_winner` (boolean, opcional): `true` para ganador, `false` para participante. Default: `true`

#### Response - Ganador Registrado

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Ganador registrado exitosamente",
  "data": {
    "winner_id": "507f1f77bcf86cd799439011",
    "user_id": "user_12345",
    "prize": "300 puntos",
    "prize_id": 201,
    "roulette_id": 6,
    "is_winner": true,
    "created_at": "2026-05-13T10:30:00.000Z",
    "remainingStock": 448
  }
}
```

#### Response - Participante Registrado (No Ganador)

**Status:** `200 OK`

```json
{
  "success": true,
  "message": "Participación registrada exitosamente",
  "data": {
    "winner_id": "507f1f77bcf86cd799439012",
    "user_id": "user_12345",
    "prize": "Sin premio",
    "prize_id": "no_winner",
    "roulette_id": 6,
    "is_winner": false,
    "created_at": "2026-05-13T10:31:00.000Z",
    "remainingStock": null
  }
}
```

#### Response - Error: Premio No Encontrado

**Status:** `404 Not Found`

```json
{
  "success": false,
  "message": "Prize not found"
}
```

#### Response - Error: Sin Stock Disponible

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "No hay stock disponible para este premio"
}
```

#### Response - Error: Campos Requeridos

**Status:** `400 Bad Request`

```json
{
  "success": false,
  "message": "user_id, prize, prize_id, and roulette_id are required"
}
```

#### Ejemplo de Uso con cURL

```bash
# Registrar ganador
curl -X POST http://localhost:3000/api/milex/winner \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "prize": "300 puntos",
    "prize_id": 201,
    "roulette_id": 6,
    "is_winner": true
  }'

# Registrar participante que no ganó
curl -X POST http://localhost:3000/api/milex/winner \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_67890",
    "prize": "Sin premio",
    "prize_id": "no_winner",
    "roulette_id": 6,
    "is_winner": false
  }'
```

---

### GET /api/milex/stats

Obtiene estadísticas detalladas de la ruleta Milex, incluyendo stock disponible y ganadores por premio.

#### Request

**URL:** `/api/milex/stats`
**Método:** `GET`

#### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "rouletteName": "Milex",
  "rouletteId": 6,
  "winProbability": "60%",
  "totalWinners": 45,
  "totalStock": 1228,
  "totalAvailable": 1183,
  "availabilityPercentage": "96.33%",
  "prizes": [
    {
      "id": 201,
      "name": "300 puntos",
      "totalStock": 450,
      "winners": 15,
      "available": 435,
      "percentage": "96.67%"
    },
    {
      "id": 202,
      "name": "500 puntos",
      "totalStock": 450,
      "winners": 18,
      "available": 432,
      "percentage": "96.00%"
    },
    {
      "id": 203,
      "name": "1000 puntos",
      "totalStock": 110,
      "winners": 5,
      "available": 105,
      "percentage": "95.45%"
    },
    {
      "id": 204,
      "name": "2000 puntos",
      "totalStock": 110,
      "winners": 4,
      "available": 106,
      "percentage": "96.36%"
    },
    {
      "id": 205,
      "name": "5000 puntos",
      "totalStock": 50,
      "winners": 2,
      "available": 48,
      "percentage": "96.00%"
    },
    {
      "id": 206,
      "name": "10000 puntos",
      "totalStock": 30,
      "winners": 1,
      "available": 29,
      "percentage": "96.67%"
    },
    {
      "id": 207,
      "name": "Sillas",
      "totalStock": 20,
      "winners": 0,
      "available": 20,
      "percentage": "100.00%"
    },
    {
      "id": 208,
      "name": "Televisores",
      "totalStock": 3,
      "winners": 0,
      "available": 3,
      "percentage": "100.00%"
    },
    {
      "id": 209,
      "name": "Mesa",
      "totalStock": 5,
      "winners": 0,
      "available": 5,
      "percentage": "100.00%"
    }
  ]
}
```

**Campos de respuesta:**
- `rouletteName` (string): Nombre de la ruleta
- `rouletteId` (number): ID de la ruleta (6)
- `winProbability` (string): Probabilidad de ganar configurada
- `totalWinners` (number): Total de premios otorgados
- `totalStock` (number): Stock total inicial
- `totalAvailable` (number): Stock total disponible actualmente
- `availabilityPercentage` (string): Porcentaje de disponibilidad general
- `prizes` (array): Detalle por cada premio:
  - `id` (number): ID del premio
  - `name` (string): Nombre del premio
  - `totalStock` (number): Stock inicial del premio
  - `winners` (number): Cantidad de veces otorgado
  - `available` (number): Stock disponible actual
  - `percentage` (string): Porcentaje de disponibilidad del premio

#### Ejemplo de Uso con cURL

```bash
curl http://localhost:3000/api/milex/stats
```

#### Ejemplo de Uso con JavaScript

```javascript
const getStats = async () => {
  const response = await fetch('http://localhost:3000/api/milex/stats');
  const stats = await response.json();

  console.log(`Probabilidad de ganar: ${stats.winProbability}`);
  console.log(`Premios otorgados: ${stats.totalWinners}`);
  console.log(`Stock disponible: ${stats.totalAvailable}/${stats.totalStock}`);

  stats.prizes.forEach(prize => {
    console.log(`${prize.name}: ${prize.available}/${prize.totalStock} disponibles`);
  });
};
```

---

### GET /api/milex/winners/download

Descarga un archivo Excel con todos los ganadores y participantes de la ruleta Milex.

#### Request

**URL:** `/api/milex/winners/download`
**Método:** `GET`

#### Response - Archivo Excel

**Status:** `200 OK`
**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
**Content-Disposition:** `attachment; filename="ganadores_milex_YYYYMMDD_HHMM.xlsx"`

**Estructura del Excel:**

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| ID | ID del registro en MongoDB | 507f1f77bcf86cd799439011 |
| Usuario | ID del usuario | user_12345 |
| Premio | Nombre del premio ganado | 300 puntos |
| ID Premio | ID del premio | 201 |
| ID Ruleta | ID de la ruleta | 6 |
| Ganador | Si es ganador | Sí / No |
| Fecha y Hora | Timestamp en zona horaria CDMX | 13/05/2026, 10:30:00 |

**Características:**
- Ordenado por fecha (más recientes primero)
- Incluye tanto ganadores como participantes
- Formato de fecha: Zona horaria de Ciudad de México
- Columnas auto-ajustadas para mejor visualización
- Hoja nombrada "Ganadores Milex"
- **Sin mapeo de customer_id** (solo incluye user_id)

#### Response - Sin Ganadores

**Status:** `404 Not Found`

```json
{
  "success": false,
  "message": "No hay ganadores para descargar"
}
```

#### Response - Error del Servidor

**Status:** `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Error al descargar ganadores",
  "error": "Mensaje de error detallado"
}
```

#### Ejemplo de Uso con cURL

```bash
# Descargar archivo Excel
curl http://localhost:3000/api/milex/winners/download \
  --output ganadores_milex.xlsx
```

#### Ejemplo de Uso con JavaScript

```javascript
const downloadWinners = async () => {
  const response = await fetch('http://localhost:3000/api/milex/winners/download');

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ganadores_milex.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } else {
    const error = await response.json();
    console.error('Error:', error.message);
  }
};
```

---

## Flujo de Uso

### 1. Configuración Inicial

```bash
# 1. Configurar variable de entorno
echo "MILEX_PROBABILITY=0.60" >> .env

# 2. Cargar stock inicial a MongoDB
npm run load-milex

# 3. Iniciar servidor
npm run dev
```

### 2. Flujo del Usuario (Frontend)

```javascript
// Paso 1: Usuario gira la ruleta
const spinResult = await fetch('/api/milex/spin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roulette_id: 6 })
});

const spin = await spinResult.json();

// Paso 2: Registrar resultado
if (spin.winner) {
  // Usuario ganó un premio
  await fetch('/api/milex/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentUserId,
      prize: spin.prize.name,
      prize_id: spin.prize.id,
      roulette_id: 6,
      is_winner: true
    })
  });

  // Mostrar premio al usuario
  showPrize(spin.prize);
} else {
  // Usuario no ganó
  await fetch('/api/milex/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: currentUserId,
      prize: 'Sin premio',
      prize_id: 'no_winner',
      roulette_id: 6,
      is_winner: false
    })
  });

  // Mostrar mensaje de "intenta de nuevo"
  showTryAgain();
}
```

### 3. Monitoreo y Reportes (Admin)

```javascript
// Ver estadísticas en tiempo real
const stats = await fetch('/api/milex/stats');
const data = await stats.json();

console.log(`Ganadores totales: ${data.totalWinners}`);
console.log(`Stock restante: ${data.totalAvailable}/${data.totalStock}`);

// Descargar reporte de ganadores
window.location.href = '/api/milex/winners/download';
```

---

## Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| **400** | Bad Request - Parámetros faltantes o inválidos | Verificar que todos los campos requeridos estén presentes |
| **404** | Not Found - Premio o recurso no encontrado | Verificar que el prize_id exista en la base de datos |
| **500** | Internal Server Error - Error del servidor | Revisar logs del servidor y conexión a MongoDB |

### Errores Comunes

#### Error: "roulette_id is required"
```json
{"success": false, "message": "roulette_id is required"}
```
**Causa:** No se envió el campo `roulette_id` en el body del request.
**Solución:** Incluir `"roulette_id": 6` en el body.

#### Error: "Prize not found"
```json
{"success": false, "message": "Prize not found"}
```
**Causa:** El `prize_id` enviado no existe en la base de datos o no corresponde al `roulette_id: 6`.
**Solución:** Verificar que el premio exista ejecutando `GET /api/milex/stats`.

#### Error: "No hay stock disponible para este premio"
```json
{"success": false, "message": "No hay stock disponible para este premio"}
```
**Causa:** El premio seleccionado ya no tiene stock disponible.
**Solución:** El sistema no debería retornar premios sin stock en `/spin`, pero si ocurre, verificar el estado del stock con `/stats`.

#### Error: "No hay ganadores para descargar"
```json
{"success": false, "message": "No hay ganadores para descargar"}
```
**Causa:** No hay registros en la base de datos para `roulette_id: 6`.
**Solución:** Esto es normal si aún no se han registrado ganadores/participantes.

---

## Algoritmo de Probabilidad Ponderada

El sistema utiliza un algoritmo de selección ponderada por stock disponible:

### Paso 1: Determinar si Gana (60%)
```javascript
const random = Math.random(); // 0.0 a 1.0
if (random > 0.60) {
  // No gana (40%)
  return "No ganaste";
}
```

### Paso 2: Seleccionar Premio con Probabilidad Ponderada

Si el usuario gana, se selecciona un premio usando pesos basados en stock disponible:

```javascript
// Ejemplo con stock actual:
// 300 puntos: 435 disponibles
// 500 puntos: 432 disponibles
// 1000 puntos: 105 disponibles
// ... etc

const totalWeight = 435 + 432 + 105 + ... = 1183;
const randomWeight = Math.random() * 1183; // 0 a 1183

// Si randomWeight cae entre:
// 0-435: Gana 300 puntos (36.8%)
// 435-867: Gana 500 puntos (36.5%)
// 867-972: Gana 1000 puntos (8.9%)
// ... y así sucesivamente
```

Este algoritmo asegura que:
1. Los premios con más stock se otorgan con mayor frecuencia
2. La distribución es equilibrada y natural
3. Conforme se agotan premios, otros se vuelven más probables
4. Nunca se selecciona un premio sin stock

---

## Notas de Implementación

### Gestión de Stock

- El campo `GANADORES` se incrementa cada vez que se registra un ganador
- El stock disponible se calcula como: `Stock - GANADORES`
- **Nunca** se decrementa el campo `Stock` directamente
- Esto mantiene un audit trail completo de premios originales vs. otorgados

### Separación de Datos

- Todos los premios usan `ID_RULETA: 6`
- Los IDs de premio van de `201` a `209` (evitando conflictos)
- Las consultas siempre filtran por `roulette_id: 6`

### Zona Horaria

- Todas las fechas en el Excel se exportan en horario de Ciudad de México
- Formato: `DD/MM/YYYY, HH:MM:SS`

### Sin Customer Mapping

A diferencia de otras ruletas, el endpoint de descarga de Milex **no incluye** mapeo de customer_id. El Excel solo contiene el `user_id` proporcionado directamente por el usuario.

---

## Logs del Servidor

El servidor genera logs útiles para debugging:

```bash
🎲 Generated probability: 45.23%
🎯 Win probability: 60.00%
# (Usuario no gana porque 45.23% < 60%)

🎲 Generated probability: 72.15%
🎯 Win probability: 60.00%
🎉 Prize won: 300 puntos (Available stock: 435)
# (Usuario gana y se selecciona premio)

🎉 Winner registered: user_12345 won 300 puntos
# (Ganador registrado en BD)

📥 Downloaded 150 Milex winners as Excel: ganadores_milex_20260513_1530.xlsx
# (Reporte descargado)
```

---

## Preguntas Frecuentes

### ¿Puedo cambiar la probabilidad de ganar?

Sí, simplemente modifica `MILEX_PROBABILITY` en el archivo `.env`:

```bash
# Para 80% de probabilidad
MILEX_PROBABILITY=0.80

# Para 30% de probabilidad
MILEX_PROBABILITY=0.30
```

Reinicia el servidor para aplicar cambios.

### ¿Cómo agrego más stock de premios?

1. Edita el archivo `Files/ruletaMilex.xlsx`
2. Actualiza las cantidades en la columna `Stock`
3. Ejecuta: `npm run load-milex`
4. Esto reemplazará todos los premios y reseteará los contadores

⚠️ **Advertencia:** Esto eliminará el conteo actual de ganadores. Para añadir stock sin resetear, modifica directamente MongoDB.

### ¿Puedo agregar nuevos premios?

Sí:
1. Abre `Files/ruletaMilex.xlsx`
2. Agrega una nueva fila con:
   - `ID_PREMIO`: Número único (ej: 210)
   - `PREMIO`: Nombre del premio
   - `Stock`: Cantidad disponible
   - `GANADORES`: 0
   - `ID_RULETA`: 6
   - `RULETA`: MILEX
3. Ejecuta: `npm run load-milex`

### ¿Qué pasa cuando se agota el stock?

Cuando todos los premios se agotan:
- `/api/milex/spin` retornará `"winner": false` con mensaje "no hay premios disponibles"
- `/api/milex/stats` mostrará `"totalAvailable": 0`
- Los usuarios verán el mensaje "Lo sentimos, no hay premios disponibles en este momento"

### ¿Cómo reseteo los ganadores pero mantengo el stock?

```javascript
// Conectar a MongoDB y ejecutar:
db.winners.deleteMany({ roulette_id: 6 });
db.stocks.updateMany(
  { ID_RULETA: 6 },
  { $set: { GANADORES: 0 } }
);
```

---

## Soporte Técnico

Para problemas o dudas:

1. Verificar logs del servidor
2. Ejecutar `GET /health` para verificar estado del sistema
3. Consultar `GET /api/milex/stats` para estado actual
4. Revisar este documento para casos de uso comunes

---

**Última actualización:** 2026-05-14
**Versión de API:** 1.0.0
**Ruleta Milex ID:** 6
**Total de Premios:** 9 tipos | 1,228 unidades

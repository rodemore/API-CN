# Ruleta Nestle (ruleta_nestle)

## Descripción General

Sistema de ruleta basado en **ventanas de tiempo** (time windows). A diferencia de los sistemas de ruleta con probabilidades aleatorias, este sistema entrega premios basándose en horarios específicos predefinidos.

## Lógica de Funcionamiento

### Principio Fundamental
**"El primer jugador que llegue cuando sea la hora, gana"**

Cuando un jugador juega:
1. El sistema verifica si existen premios cuya hora de entrega (`draw_datetime`) ya ha pasado
2. Si hay premios disponibles y aún no han sido reclamados, el jugador gana automáticamente el premio más antiguo
3. Si todos los premios disponibles ya fueron reclamados o aún no es hora de ningún premio, el jugador pierde

### Características Clave
- ✅ **Sin probabilidades**: No hay factor de azar, solo timing
- ✅ **FIFO (First In, First Out)**: El primer premio disponible es el que se entrega
- ✅ **Un ganador por premio**: Cada premio solo puede ser reclamado una vez
- ✅ **Tiempo real**: Los premios se activan automáticamente cuando llega su hora

## Datos Cargados

- **Total de premios**: 300 premios
- **Período activo**: 14 de octubre de 2024 - 14 de diciembre de 2024
- **Archivo fuente**: `Files/TimeWindow-Nestle.xlsx`

### Tipos de Premios

| Premio | Cantidad |
|--------|----------|
| 100 Puntos | 150 |
| 250 Puntos | 100 |
| 500 Puntos | 40 |
| 1000 Puntos | 10 |

### Formato del Archivo Excel

- Columna A: Número de premio
- Columna B: Nombre del premio
- Columna C: Fecha y hora de disponibilidad (draw_datetime en formato ISO)

## Modelos de Datos

### TimeWindowPrizeNestle
Almacena los premios con sus ventanas de tiempo.

```javascript
{
  prize_name: String,           // Nombre del premio
  draw_datetime: Date,          // Fecha/hora cuando el premio está disponible
  is_claimed: Boolean,          // Si ya fue reclamado
  winner_user_id: String,       // ID del usuario que lo ganó
  claimed_at: Date              // Fecha/hora en que fue reclamado
}
```

### NestleWinner
Registra a todos los participantes (ganadores y perdedores).

```javascript
{
  user_id: String,              // ID del usuario
  is_winner: Boolean,           // Si ganó o no
  prize_name: String,           // Nombre del premio (null si perdió)
  prize_id: ObjectId,           // ID del premio (null si perdió)
  play_datetime: Date           // Fecha/hora en que jugó
}
```

## API Endpoints

### POST /api/ruleta_nestle/spin
Gira la ruleta para un usuario.

**Request Body:**
```json
{
  "user_id": "usuario_123"
}
```

**Response (Ganador):**
```json
{
  "success": true,
  "winner": true,
  "message": "¡Felicidades! Has ganado un premio",
  "prize": {
    "id": "6aa0e37bd076fb9628b1c494",
    "name": "100 Puntos",
    "draw_datetime": "2026-09-09T05:04:38.000Z",
    "remaining_unclaimed": 145
  }
}
```

**Response (Perdedor):**
```json
{
  "success": true,
  "winner": false,
  "message": "No ganaste esta vez. ¡Sigue intentando!"
}
```

### POST /api/ruleta_nestle/winner
Registra a un ganador o participante.

**Request Body (Ganador):**
```json
{
  "user_id": "usuario_123",
  "prize_name": "100 Puntos",
  "prize_id": "6aa0e37bd076fb9628b1c494",
  "is_winner": true
}
```

**Request Body (Perdedor):**
```json
{
  "user_id": "usuario_123",
  "is_winner": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ganador registrado exitosamente",
  "data": {
    "winner_id": "6aa0e48c1370cc53fb8df54c",
    "user_id": "usuario_123",
    "prize_name": "100 Puntos",
    "prize_id": "6aa0e37bd076fb9628b1c494",
    "is_winner": true,
    "play_datetime": "2026-09-09T04:46:04.449Z"
  }
}
```

### GET /api/ruleta_nestle/stats
Obtiene estadísticas del sistema.

**Response:**
```json
{
  "success": true,
  "system": "Time Window Based (First Come, First Served)",
  "currentTime": "2026-09-29T05:20:06.939Z",
  "totalPrizes": 300,
  "claimedPrizes": 0,
  "availablePrizes": 300,
  "futurePrizes": 0,
  "totalWinners": 0,
  "totalParticipants": 0,
  "dateRange": {
    "start": "2024-10-14T00:00:00.000Z",
    "end": "2024-12-14T19:02:22.804Z"
  },
  "prizeBreakdown": [
    {
      "name": "100 Puntos",
      "total": 150,
      "claimed": 0,
      "remaining": 150
    },
    {
      "name": "250 Puntos",
      "total": 100,
      "claimed": 0,
      "remaining": 100
    },
    {
      "name": "500 Puntos",
      "total": 40,
      "claimed": 0,
      "remaining": 40
    },
    {
      "name": "1000 Puntos",
      "total": 10,
      "claimed": 0,
      "remaining": 10
    }
  ]
}
```

### GET /api/ruleta_nestle/winners/download
Descarga un archivo Excel con todos los participantes.

**Response:**
- Archivo Excel con nombre: `ruleta_nestle_participantes_YYYYMMDD_HHMM.xlsx`
- Columnas: ID, Usuario (External ID), Ganador, Premio, ID Premio, Fecha y Hora de Juego
- Formato de fecha: México City timezone
- Ordenado por fecha de juego (más reciente primero)

## Comandos de Gestión

### Cargar datos desde Excel
```bash
npm run load-nestle
```

Este comando:
1. Lee el archivo `Files/TimeWindow-Nestle.xlsx`
2. Elimina datos anteriores en la base de datos
3. Carga todos los premios con sus ventanas de tiempo
4. Muestra estadísticas de carga

### Iniciar servidor
```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

## Flujo de Integración Frontend

### Paso 1: Girar la ruleta
```javascript
const response = await fetch('http://localhost:3000/api/ruleta_nestle/spin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: 'usuario_123' })
});

const result = await response.json();
```

### Paso 2: Registrar resultado
```javascript
if (result.winner) {
  // Usuario ganó - registrar ganador
  await fetch('http://localhost:3000/api/ruleta_nestle/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'usuario_123',
      prize_name: result.prize.name,
      prize_id: result.prize.id,
      is_winner: true
    })
  });

  // Mostrar premio al usuario
  alert(`¡Ganaste ${result.prize.name}!`);

} else {
  // Usuario no ganó - registrar participación
  await fetch('http://localhost:3000/api/ruleta_nestle/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'usuario_123',
      is_winner: false
    })
  });

  // Mostrar mensaje de ánimo
  alert('No ganaste esta vez. ¡Sigue intentando!');
}
```

## Notas Importantes

1. **Zona horaria**: Todas las fechas están en UTC. El archivo Excel debe tener fechas en formato ISO.

2. **Atomicidad**: Es importante que el frontend llame primero a `/spin` y luego inmediatamente a `/winner` para evitar inconsistencias.

3. **Premios no se decrementan**: Los premios se marcan como "reclamados" (`is_claimed: true`) en lugar de decrementar un stock. Esto mantiene un registro completo.

4. **Sin límite de intentos**: Un usuario puede jugar múltiples veces. El sistema solo controla si hay premios disponibles, no cuántas veces jugó un usuario.

5. **Descarga incluye todos**: El endpoint de descarga incluye tanto ganadores como perdedores para tener un registro completo de participación.

## Arquitectura del Sistema

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ POST /spin
       ▼
┌─────────────────────────────┐
│   Verificar premios         │
│   disponibles:              │
│   - draw_datetime <= now    │
│   - is_claimed = false      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────┐      ┌────────────────┐
│  ¿Hay premios?  │─NO──►│ Retornar loss  │
└────────┬────────┘      └────────────────┘
         │ SÍ
         ▼
┌─────────────────────────┐
│ Retornar premio más     │
│ antiguo (FIFO)          │
└──────┬──────────────────┘
       │
       │ POST /winner
       ▼
┌─────────────────────────┐
│ Registrar ganador       │
│ Marcar premio claimed   │
└─────────────────────────┘
```

## Diferencias con Otros Sistemas de Ruleta

| Característica | Ruleta Normal | RuletaNestle (Time Window) |
|----------------|---------------|----------------------------|
| Mecánica | Probabilidad aleatoria | Ventanas de tiempo |
| Ganadores | Múltiples por premio | Uno por premio |
| Stock | Se decrementa | Se marca como reclamado |
| Timing | Cualquier momento | Horarios específicos |
| Repetición | Premios se pueden repetir | Cada premio es único |
| Predictibilidad | Impredecible | Predecible (si llegas primero) |

## Monitoreo y Mantenimiento

### Ver estadísticas en tiempo real
```bash
curl http://localhost:3000/api/ruleta_nestle/stats | python3 -m json.tool
```

### Verificar primer premio disponible
```javascript
// Conectarse a MongoDB y ejecutar:
db.timewindowprizeneстles.find({
  draw_datetime: { $lte: new Date() },
  is_claimed: false
}).sort({ draw_datetime: 1 }).limit(1)
```

### Resetear sistema (cuidado)
```bash
# SOLO USAR EN DESARROLLO
npm run load-nestle  # Recarga todos los premios y resetea claims
```

## Soporte

Para reportar problemas o solicitar cambios en el sistema de Ruleta Nestle, contacta al equipo de desarrollo.

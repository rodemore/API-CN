# Ruleta Pepsico (ruleta_pep)

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

- **Total de premios**: 2,581 premios
- **Período activo**: 9 de septiembre de 2026 - 31 de octubre de 2026
- **Archivo fuente**: `Timewindow-Pepsico_Modo_Turbo (2) (1).xlsx` (hoja: "Set-Out 2026 - Modo Turbo")
- **Día excluido**: 8 de septiembre de 2026 (NO se cargaron premios de ese día)

### Tipos de Premios

| Premio | Cantidad |
|--------|----------|
| 1.000 Pontos no Club B | 589 |
| 5.000 Pontos no Club B | 412 |
| 10.000 Pontos no Club B | 412 |
| 15.000 Pontos no Club B | 295 |
| 20.000 Pontos no Club B | 295 |
| Mini Capacete | 196 |
| 25.000 Pontos no Club B | 177 |
| 30.000 Pontos no Club B | 176 |
| Celular | 29 |

## Modelos de Datos

### TimeWindowPrize
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

### PepsicoWinner
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

### POST /api/ruleta_pep/spin
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
    "name": "1.000 Pontos no Club B",
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

### POST /api/ruleta_pep/winner
Registra a un ganador o participante.

**Request Body (Ganador):**
```json
{
  "user_id": "usuario_123",
  "prize_name": "1.000 Pontos no Club B",
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
    "prize_name": "1.000 Pontos no Club B",
    "prize_id": "6aa0e37bd076fb9628b1c494",
    "is_winner": true,
    "play_datetime": "2026-09-09T04:46:04.449Z"
  }
}
```

### GET /api/ruleta_pep/stats
Obtiene estadísticas del sistema.

**Response:**
```json
{
  "success": true,
  "system": "Time Window Based (First Come, First Served)",
  "currentTime": "2026-09-09T04:42:41.101Z",
  "totalPrizes": 2581,
  "claimedPrizes": 0,
  "availablePrizes": 0,
  "futurePrizes": 2581,
  "totalWinners": 0,
  "totalParticipants": 0,
  "dateRange": {
    "start": "2026-09-09T05:04:38.000Z",
    "end": "2026-11-01T04:50:08.000Z"
  },
  "prizeBreakdown": [
    {
      "name": "1.000 Pontos no Club B",
      "total": 589,
      "claimed": 0,
      "remaining": 589
    }
    // ... más premios
  ]
}
```

### GET /api/ruleta_pep/winners/download
Descarga un archivo Excel con todos los participantes.

**Response:**
- Archivo Excel con nombre: `ruleta_pep_participantes_YYYYMMDD_HHMM.xlsx`
- Columnas: ID, Usuario (External ID), Ganador, Premio, ID Premio, Fecha y Hora de Juego
- Formato de fecha: México City timezone
- Ordenado por fecha de juego (más reciente primero)

## Comandos de Gestión

### Cargar datos desde Excel
```bash
npm run load-pepsico
```

Este comando:
1. Lee el archivo `Timewindow-Pepsico_Modo_Turbo (2) (1).xlsx`
2. Excluye premios del 8 de septiembre
3. Elimina datos anteriores en la base de datos
4. Carga 2,581 premios con sus ventanas de tiempo
5. Muestra estadísticas de carga

### Iniciar servidor
```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

## Scripts de Prueba

### Test básico del sistema
```bash
node scripts/testRuletaPep.js
```

Verifica:
- Total de premios cargados
- Ningún premio reclamado inicialmente
- Primer premio es del 9 de septiembre
- Registro de participantes sin premio

### Test de flujo completo de ganador
```bash
node scripts/testRuletaPepWinFlow.js
```

Verifica:
- Spin cuando hay premios disponibles
- Registro de ganador
- Premio marcado como reclamado
- Premio no se repite en siguiente spin
- Integridad de datos
- Limpieza y restauración

## Flujo de Integración Frontend

### Paso 1: Girar la ruleta
```javascript
const response = await fetch('http://localhost:3000/api/ruleta_pep/spin', {
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
  await fetch('http://localhost:3000/api/ruleta_pep/winner', {
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
  await fetch('http://localhost:3000/api/ruleta_pep/winner', {
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

1. **Zona horaria**: Todas las fechas están en UTC. El archivo Excel tiene fechas en formato ISO.

2. **Primer premio disponible**: El primer premio estará disponible el 9 de septiembre de 2026 a las 05:04:38 UTC.

3. **Atomicidad**: Es importante que el frontend llame primero a `/spin` y luego inmediatamente a `/winner` para evitar inconsistencias.

4. **Premios no se decrementan**: Los premios se marcan como "reclamados" (`is_claimed: true`) en lugar de decrementar un stock. Esto mantiene un registro completo.

5. **Sin límite de intentos**: Un usuario puede jugar múltiples veces. El sistema solo controla si hay premios disponibles, no cuántas veces jugó un usuario.

6. **Descarga incluye todos**: El endpoint de descarga incluye tanto ganadores como perdedores para tener un registro completo de participación.

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

| Característica | Ruleta Normal | RuletaPep (Time Window) |
|----------------|---------------|-------------------------|
| Mecánica | Probabilidad aleatoria | Ventanas de tiempo |
| Ganadores | Múltiples por premio | Uno por premio |
| Stock | Se decrementa | Se marca como reclamado |
| Timing | Cualquier momento | Horarios específicos |
| Repetición | Premios se pueden repetir | Cada premio es único |
| Predictibilidad | Impredecible | Predecible (si llegas primero) |

## Monitoreo y Mantenimiento

### Ver estadísticas en tiempo real
```bash
curl http://localhost:3000/api/ruleta_pep/stats | python3 -m json.tool
```

### Verificar primer premio disponible
```javascript
// Conectarse a MongoDB y ejecutar:
db.timewindowprizes.find({
  draw_datetime: { $lte: new Date() },
  is_claimed: false
}).sort({ draw_datetime: 1 }).limit(1)
```

### Resetear sistema (cuidado)
```bash
# SOLO USAR EN DESARROLLO
npm run load-pepsico  # Recarga todos los premios y resetea claims
```

## Soporte

Para reportar problemas o solicitar cambios en el sistema de Ruleta Pepsico, contacta al equipo de desarrollo.

# API de Ruleta

API REST para gestión de premios y stock de una ruleta.

## Requisitos

- Node.js v14+
- MongoDB instalado y corriendo

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

## Configuración

Edita `config.json` para ajustar la conexión a MongoDB:

```json
{
  "mongodb": {
    "uri": "mongodb://localhost:27017/ruleta"
  },
  "server": {
    "port": 3000
  }
}
```

## Uso

### 1. Cargar el stock inicial

Antes de iniciar el servidor, carga los datos del archivo `Premios.xlsx` a MongoDB:

```bash
npm run load-stock
```

### 2. Iniciar el servidor

```bash
npm start
```

O en modo desarrollo (con auto-reload):

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints

### GET /api/stock

Obtiene todo el stock de premios disponibles.

**Respuesta:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "ID_PREMIO": 1,
      "PREMIO": "100 ptos",
      "Stock": 200,
      "GANADORES": "TBC",
      "PROBABILIDAD": "Todos los jugadores",
      "ID_RULETA": 1
    }
  ]
}
```

### GET /api/stock/:id

Obtiene un premio específico por su ID.

**Ejemplo:** `GET /api/stock/1`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "ID_PREMIO": 1,
    "PREMIO": "100 ptos",
    "Stock": 200,
    "GANADORES": "TBC",
    "PROBABILIDAD": "Todos los jugadores",
    "ID_RULETA": 1
  }
}
```

### POST /api/roulette/spin

Lanza la ruleta para determinar si el usuario gana un premio.

**Body:**
```json
{
  "roulette_id": 1
}
```

**Respuesta (ganador):**
```json
{
  "success": true,
  "winner": true,
  "message": "¡Felicidades! Has ganado un premio",
  "prize": {
    "id": 3,
    "name": "Toalla",
    "roulette_id": 1,
    "remainingStock": 49
  }
}
```

**Respuesta (no ganador):**
```json
{
  "success": true,
  "winner": false,
  "message": "No ganaste esta vez. ¡Sigue intentando!"
}
```

### POST /api/roulette/winner

Registra un ganador en la base de datos.

**Body:**
```json
{
  "user_id": "user123",
  "prize": "Toalla",
  "prize_id": 3,
  "roulette_id": 1
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Ganador registrado exitosamente",
  "data": {
    "winner_id": "65f1234567890abcdef12345",
    "user_id": "user123",
    "prize": "Toalla",
    "prize_id": 3,
    "roulette_id": 1,
    "created_at": "2024-03-04T10:30:00.000Z",
    "remainingStock": 49
  }
}
```

### GET /api/roulette/stats

Obtiene estadísticas de la ruleta y los premios.

**Respuesta:**
```json
{
  "success": true,
  "winProbability": "80%",
  "totalWinners": 25,
  "prizes": [
    {
      "id": 1,
      "name": "100 ptos",
      "totalStock": 200,
      "winners": 10,
      "available": 190
    }
  ]
}
```

### GET /api/roulette/winners/download

Descarga todos los ganadores en formato Excel (.xlsx).

Este endpoint devuelve un archivo Excel con todos los ganadores registrados, ordenados por fecha (más recientes primero).

**Columnas del Excel:**
- ID: ID único del ganador
- Usuario: ID del usuario ganador
- Premio: Nombre del premio ganado
- ID Premio: ID del premio
- ID Ruleta: ID de la ruleta
- Fecha y Hora: Fecha y hora del premio (formato México)

**Ejemplo de uso:**
```bash
# Descargar desde el navegador
http://localhost:3000/api/roulette/winners/download

# Descargar con curl
curl -O -J http://localhost:3000/api/roulette/winners/download
```

El archivo se descargará con el nombre: `ganadores_YYYYMMDD_HHMM.xlsx`

## Estructura del Proyecto

```
API/
├── config/
│   └── database.js          # Configuración de MongoDB
├── models/
│   └── Stock.js             # Modelo de Stock de premios
├── routes/
│   └── stock.js             # Rutas del stock
├── scripts/
│   └── loadInitialStock.js  # Script para cargar datos iniciales
├── Files/
│   └── Premios.xlsx         # Archivo con los premios
├── config.json              # Configuración de la app
├── server.js                # Servidor principal
└── package.json             # Dependencias
```

## Próximos pasos

- [ ] Agregar modelos para Spins/Tiradas
- [ ] Agregar modelo para Logs de usuario
- [ ] Crear endpoints POST para registrar tiradas
- [ ] Implementar actualización de stock en tiempo real

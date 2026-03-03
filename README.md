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

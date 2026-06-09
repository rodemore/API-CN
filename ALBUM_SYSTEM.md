# Sistema de Álbumes - Documentación

## Descripción General

Sistema de álbumes que permite a los usuarios abrir packs de 3 stickers con premios integrados. Cada pack contiene:
- **2 stickers sin premio** (decorativos)
- **1 sticker con premio** (200, 1000 o 20000 puntos)

## Arquitectura

### Modelos de Base de Datos

#### AlbumStock
Gestiona el inventario de stickers para todos los álbumes.

```javascript
{
  ALBUM_ID: String,        // Código del país (HN, GT, SV, etc.)
  STICKER_ID: String,      // ID único del sticker (sv1, mu2, etc.)
  STICKER_NAME: String,    // Nombre descriptivo
  STICKER_URL: String,     // URL de la imagen en S3
  PRIZE_POINTS: Number,    // Puntos del premio (0 para sin premio)
  BRAND: String,           // Marca: 'sv' (Salva Vida), 'mu' (Michelob Ultra)
  IS_PRIZE: Boolean,       // true si tiene premio
  STOCK: Number,           // Stock total disponible
  GANADORES: Number        // Cantidad de veces otorgado
}
```

#### AlbumWinner
Registra todos los packs abiertos por los usuarios.

```javascript
{
  user_id: String,         // ID del usuario
  album_id: String,        // Código del álbum
  pack_stickers: [{        // Array de 3 stickers recibidos
    sticker_id: String,
    sticker_name: String,
    sticker_url: String,
    prize_points: Number,
    brand: String,
    is_prize: Boolean
  }],
  total_prize_points: Number,  // Puntos totales ganados
  prize_sticker: {             // Sticker premiado del pack
    sticker_id: String,
    sticker_name: String,
    prize_points: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Probabilidades de Premios

Las probabilidades están definidas localmente en el backend:

- **200 puntos**: 75% de probabilidad
- **1000 puntos**: 23% de probabilidad
- **20000 puntos**: 2% de probabilidad

```javascript
function getRandomPrizePoints() {
  const random = Math.random();
  if (random < 0.75) return 200;   // 75%
  if (random < 0.98) return 1000;  // 23%
  return 20000;                    // 2%
}
```

## API Endpoints

### 1. Abrir Pack
**POST** `/api/album/open-pack`

Abre un pack y retorna 3 stickers (2 sin premio + 1 con premio).

**Request Body:**
```json
{
  "album_id": "HN",
  "user_id": "usuario123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "¡Pack abierto exitosamente!",
  "data": {
    "album_id": "HN",
    "user_id": "usuario123",
    "pack_stickers": [
      {
        "sticker_id": "mu8",
        "sticker_name": "Michelob Ultra Game 7 - No Prize",
        "sticker_url": "https://...",
        "prize_points": 0,
        "brand": "mu",
        "is_prize": false
      },
      {
        "sticker_id": "sv7",
        "sticker_name": "Salva Vida Game 7 - No Prize",
        "sticker_url": "https://...",
        "prize_points": 0,
        "brand": "sv",
        "is_prize": false
      },
      {
        "sticker_id": "sv5",
        "sticker_name": "Salva Vida Game 5",
        "sticker_url": "https://...",
        "prize_points": 200,
        "brand": "sv",
        "is_prize": true
      }
    ],
    "total_prize_points": 200,
    "prize_sticker": {
      "sticker_id": "sv5",
      "sticker_name": "Salva Vida Game 5",
      "prize_points": 200
    },
    "remaining_stock": 149
  }
}
```

### 2. Registrar Ganador
**POST** `/api/album/register-winner`

Registra el pack abierto en la base de datos e incrementa el contador de ganadores.

**Request Body:**
```json
{
  "user_id": "usuario123",
  "album_id": "HN",
  "pack_stickers": [...],  // Array de 3 stickers del response anterior
  "total_prize_points": 200,
  "prize_sticker": {
    "sticker_id": "sv5",
    "sticker_name": "Salva Vida Game 5",
    "prize_points": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ganador registrado exitosamente",
  "data": {
    "winner_id": "6a2840735d6462e787ea05d0",
    "user_id": "usuario123",
    "album_id": "HN",
    "total_prize_points": 200,
    "prize_sticker": {...},
    "created_at": "2026-06-09T16:33:55.247Z",
    "remaining_stock": 148
  }
}
```

### 3. Obtener Stock
**GET** `/api/album/stock/:album_id`

Retorna todos los stickers disponibles para un álbum específico.

**Response:**
```json
{
  "success": true,
  "album_id": "HN",
  "total_stickers": 16,
  "stickers": [
    {
      "sticker_id": "sv1",
      "sticker_name": "Salva Vida Game 1",
      "sticker_url": "https://...",
      "prize_points": 20000,
      "brand": "sv",
      "is_prize": true,
      "total_stock": 10,
      "awarded": 0,
      "available": 10
    },
    ...
  ]
}
```

### 4. Obtener Estadísticas
**GET** `/api/album/stats/:album_id`

Retorna estadísticas detalladas del álbum.

**Response:**
```json
{
  "success": true,
  "album_id": "HN",
  "prize_probabilities": {
    "200pts": "75%",
    "1000pts": "23%",
    "20000pts": "2%"
  },
  "summary": {
    "total_prize_stock": 840,
    "total_prizes_awarded": 5,
    "total_prizes_available": 835,
    "total_non_prize_stickers": 4
  },
  "prizes_by_points": [
    {
      "prize_points": 20000,
      "total_stock": 40,
      "awarded": 0,
      "available": 40,
      "stickers": [...]
    },
    {
      "prize_points": 1000,
      "total_stock": 200,
      "awarded": 2,
      "available": 198,
      "stickers": [...]
    },
    {
      "prize_points": 200,
      "total_stock": 600,
      "awarded": 3,
      "available": 597,
      "stickers": [...]
    }
  ],
  "non_prize_stickers": [...]
}
```

### 5. Descargar Ganadores en Excel
**GET** `/api/album/winners/download/:album_id`

Descarga un archivo Excel con todos los ganadores del álbum especificado.

**Response:** Archivo Excel con las siguientes columnas:
- ID
- Usuario
- Álbum
- Puntos Ganados
- Sticker Premio
- ID Sticker Premio
- Sticker 1
- Sticker 2
- Sticker 3
- Fecha y Hora

**Filename:** `ganadores_album_HN_YYYYMMDD_HHMM.xlsx`

## Configuración de Stock

### Crear Excel de Stickers

El archivo Excel debe tener las siguientes columnas:

| ALBUM_ID | STICKER_ID | STICKER_NAME | STICKER_URL | PRIZE_POINTS | BRAND | STOCK |
|----------|------------|--------------|-------------|--------------|-------|-------|
| HN | sv1 | Salva Vida Game 1 | https://... | 20000 | sv | 10 |
| HN | mu1 | Michelob Ultra Game 1 | https://... | 20000 | mu | 10 |
| HN | sv7 | Salva Vida Game 7 - No Prize | https://... | 0 | sv | 999999 |

**Ejemplo de distribución para HN:**

- **20000 pts**: 4 stickers (2 SV + 2 MU) con 10 stock cada uno = 40 total
- **1000 pts**: 4 stickers (2 SV + 2 MU) con 50 stock cada uno = 200 total
- **200 pts**: 4 stickers (2 SV + 2 MU) con 150 stock cada uno = 600 total
- **Sin premio**: 4 stickers (2 SV + 2 MU) con stock ilimitado (999999)

### Cargar Stock en MongoDB

1. **Crear archivo Excel:**
```bash
node scripts/createHNAlbumExcel.js
```

2. **Cargar stock desde Excel:**
```bash
npm run load-album-v2
```

El script:
- Limpia la colección `AlbumStock`
- Lee el archivo `Files/AlbumStockHN.xlsx`
- Inserta todos los stickers en MongoDB
- Muestra resumen por álbum y tipo de premio

## Flujo de Integración con Frontend

### 1. Usuario abre pack
```javascript
// Frontend llama a /api/album/open-pack
const response = await fetch('/api/album/open-pack', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    album_id: 'HN',
    user_id: userId
  })
});

const packData = await response.json();
// packData.data.pack_stickers contiene los 3 stickers
// packData.data.prize_sticker indica cuál es el premiado
```

### 2. Mostrar animación
```javascript
// Mostrar los 3 stickers con animación
// El sticker en posición 2 (index 2) es siempre el premiado
packData.data.pack_stickers.forEach((sticker, index) => {
  displaySticker(sticker, index === 2); // true si es el premiado
});
```

### 3. Registrar ganador
```javascript
// Una vez que el usuario ve los stickers, registrar
await fetch('/api/album/register-winner', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(packData.data)
});
```

## Álbumes Soportados

Actualmente configurados en el sistema:

- **HN** - Honduras
- **GT** - Guatemala
- **SV** - El Salvador
- **NI** - Nicaragua
- **CR** - Costa Rica
- **PA** - Panamá
- **DO** - República Dominicana
- **EC** - Ecuador
- **PY** - Paraguay
- **BO** - Bolivia

## Agregar Nuevo Álbum

1. **Crear script de Excel:**
```javascript
// scripts/createGTAlbumExcel.js
const GT_STICKERS = [
  // Definir stickers para Guatemala...
];
```

2. **Generar Excel:**
```bash
node scripts/createGTAlbumExcel.js
```

3. **Actualizar script de carga** para apuntar al nuevo archivo:
```javascript
const excelPath = './Files/AlbumStockGT.xlsx';
```

4. **Cargar stock:**
```bash
npm run load-album-v2
```

## Notas Importantes

- Los **stickers sin premio** tienen `STOCK: 999999` (ilimitado)
- El sistema **no decrementa stock directamente**, usa el contador `GANADORES`
- Stock disponible = `STOCK - GANADORES`
- Cada pack **siempre retorna exactamente 3 stickers**
- El sticker premiado está en la **posición 2** (index 2) del array
- Las probabilidades están **hardcodeadas en el backend**, no en base de datos
- Los stickers sin premio **nunca se repiten** en el mismo pack

## Troubleshooting

### Error: "Not enough non-prize stickers available"
- Verificar que el álbum tenga al menos 2 stickers con `IS_PRIZE: false`

### Error: "No hay premios disponibles"
- Todo el stock de premios se agotó
- Recargar stock o ajustar cantidades en el Excel

### Stock negativo en respuesta
- Verificar que `GANADORES` no exceda `STOCK` en la base de datos
- Recalcular contadores si es necesario

## Próximos Pasos

- [ ] Implementar validación de límite de packs por usuario
- [ ] Agregar endpoint para obtener historial de packs de un usuario
- [ ] Implementar sistema de notificaciones para premios mayores
- [ ] Agregar analytics de distribución de premios

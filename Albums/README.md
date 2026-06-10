# 📖 Álbumes - Sistema Integrado

Esta carpeta contiene los archivos HTML del sistema de álbumes integrados con el API de producción.

## 📁 Archivos

### HN_album.html
**HTML integrado con API** para el álbum de Honduras (HN).

✅ **Características:**
- Conectado a API en producción: `https://api-cn.onrender.com`
- Apertura de packs dinámica desde backend
- Registro automático de ganadores
- Gestión inteligente de user_id (URL params, Braze, temporal)
- Manejo de errores robusto
- Loading states y animaciones
- Visualización de puntos ganados

🔧 **Uso:**
```html
<!-- Sin parámetros: usa ID temporal -->
HN_album.html

<!-- Con user_id específico -->
HN_album.html?user_id=usuario123
```

### TEST_API.html
**Página de pruebas** para verificar integración del API.

✅ **Funcionalidades:**
- Botón "Abrir Pack" - Llama a `/api/album/open-pack`
- Botón "Ver Estadísticas" - Llama a `/api/album/stats/HN`
- Botón "Ver Stock" - Llama a `/api/album/stock/HN`
- Visualización de respuestas JSON
- Muestra imágenes de stickers recibidos
- Console logs para debugging

🧪 **Usar para:**
- Verificar que el API responde correctamente
- Debugging de problemas
- Ver estructura de datos
- Probar antes de deployar HN_album.html

### INTEGRACION.md
**Documentación completa** de la integración.

📖 **Contiene:**
- Cambios realizados al HTML
- Nuevas funciones agregadas
- Flujo de usuario completo
- Configuración para otros álbumes
- Troubleshooting
- Notas técnicas

## 🚀 Quick Start

### 1. Probar la Integración

Abrir `TEST_API.html` en el navegador:
```bash
open TEST_API.html
```

Hacer clic en "🎁 Abrir Pack" y verificar:
- ✅ Se llama al API correctamente
- ✅ Se reciben 3 stickers (2 sin premio + 1 con premio)
- ✅ Se muestran los puntos ganados
- ✅ Se registra el ganador automáticamente

### 2. Usar el HTML Principal

Abrir `HN_album.html` en el navegador:
```bash
open HN_album.html
```

O con user_id:
```bash
open "HN_album.html?user_id=test_user_001"
```

### 3. Verificar en Console

Abrir DevTools (F12) → Console:
```
🎮 Iniciando apertura de pack...
📡 Llamando al API...
✅ Pack recibido del API: {...}
🎨 Stickers procesados: [...]
📝 Registrando ganador...
```

## 🌍 API Endpoints Usados

Base URL: `https://api-cn.onrender.com/api/album`

### 1. Abrir Pack
```http
POST /open-pack
Content-Type: application/json

{
  "album_id": "HN",
  "user_id": "usuario123"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "¡Pack abierto exitosamente!",
  "data": {
    "pack_stickers": [
      {
        "sticker_id": "mu8",
        "sticker_url": "https://...",
        "prize_points": 0,
        "brand": "mu",
        "is_prize": false
      },
      {
        "sticker_id": "sv7",
        "sticker_url": "https://...",
        "prize_points": 0,
        "brand": "sv",
        "is_prize": false
      },
      {
        "sticker_id": "sv5",
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
    }
  }
}
```

### 2. Registrar Ganador
```http
POST /register-winner
Content-Type: application/json

{
  "user_id": "usuario123",
  "album_id": "HN",
  "pack_stickers": [...],
  "total_prize_points": 200,
  "prize_sticker": {...}
}
```

### 3. Ver Estadísticas
```http
GET /stats/HN
```

### 4. Ver Stock
```http
GET /stock/HN
```

## 🎯 Crear Álbum para Otro País

Para Guatemala (GT), El Salvador (SV), etc:

### 1. Duplicar HTML
```bash
cp HN_album.html GT_album.html
```

### 2. Modificar Configuración
```javascript
// En GT_album.html, cambiar:
const ALBUM_ID = 'GT'; // Era 'HN'
```

### 3. Actualizar Imagen del Pack
```html
<!-- Cambiar la URL de la imagen -->
<img src="https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/GT/GT_CoverPageGame.png">
```

### 4. Cargar Stock en Backend
```bash
# Crear archivo Excel con stickers de Guatemala
node scripts/createGTAlbumExcel.js

# Cargar en MongoDB
npm run load-album-v2
```

## 📊 Probabilidades

Definidas en el backend (no modificables desde frontend):

| Premio | Probabilidad |
|--------|--------------|
| 200 pts | 75% |
| 1000 pts | 23% |
| 20000 pts | 2% |

## ⚙️ Configuración de User ID

El HTML obtiene user_id en este orden:

1. **URL Parameter**: `?user_id=123` (más prioritario)
2. **Braze Bridge**: `appboyBridge.getUser().getUserId()`
3. **Session Storage**: ID temporal generado automáticamente

```javascript
// Ver user_id actual en console:
console.log(getUserId());
```

## 🐛 Troubleshooting

### "Error al abrir el pack"
**Causa:** API no responde o está en cold start
**Solución:** Esperar 10-15 segundos y reintentar

### "No hay premios disponibles"
**Causa:** Stock agotado
**Solución:** Recargar stock con `npm run load-album-v2`

### Stickers no se muestran
**Causa:** URLs de S3 incorrectas
**Solución:** Verificar URLs en Excel y recargar stock

### CORS Error
**Causa:** API no permite el dominio
**Solución:** Verificar que CORS esté habilitado en backend

## 📱 Integración con Braze

### 1. Subir HTML a Braze
- Copiar contenido de `HN_album.html`
- Crear nuevo In-App Message (Custom Code)
- Pegar el código

### 2. Configurar Triggers
- Evento: "album_pack_available"
- Frecuencia: 1 vez por campaña

### 3. Testing
- Usar Preview mode con test user
- Verificar que `appboyBridge` funciona
- Confirmar que user_id se obtiene correctamente

## 🔒 Seguridad

### Validaciones en Backend
- ✅ Stock disponible antes de abrir pack
- ✅ User_id requerido
- ✅ Album_id válido
- ✅ Probabilidades server-side (no manipulables)

### Datos Sensibles
- ❌ No hay API keys en frontend
- ❌ No hay passwords hardcodeadas
- ✅ Todos los cálculos críticos en backend

## 📈 Métricas

Eventos que se pueden trackear:

1. **Pack Opened** - Usuario abre pack
2. **Prize Won** - Premio otorgado y puntos
3. **Error Occurred** - Errores durante apertura
4. **Redirect to BEES** - Click en "Obtener Más"

Agregar tracking:
```javascript
// En HN_album.html, después de línea 505:
analytics.track('Pack Opened', {
  album_id: ALBUM_ID,
  user_id: userId,
  prize_points: packData.total_prize_points
});
```

## 📚 Documentación Relacionada

- [INTEGRACION.md](./INTEGRACION.md) - Detalles de integración
- [../ALBUM_SYSTEM.md](../ALBUM_SYSTEM.md) - Sistema completo de álbumes
- [../README.md](../README.md) - API general

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar logs en DevTools Console
2. Verificar estado del API: `https://api-cn.onrender.com/health`
3. Probar con `TEST_API.html` primero
4. Consultar documentación en `INTEGRACION.md`

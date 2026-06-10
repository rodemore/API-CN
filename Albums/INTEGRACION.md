# Integración HTML - API de Álbumes

## ✅ Integración Completada

El archivo `HN_album.html` ha sido integrado con el API de producción en **https://api-cn.onrender.com**

## 🔄 Cambios Realizados

### 1. **Configuración del API**
```javascript
const API_BASE_URL = 'https://api-cn.onrender.com/api/album';
const ALBUM_ID = 'HN';
```

### 2. **Gestión de User ID**
Se agregó lógica para obtener el `user_id` de múltiples fuentes:
- **URL Parameters**: `?user_id=123`
- **Braze/Appboy**: Desde el bridge de Braze
- **Temporal**: Genera y guarda un ID temporal en sessionStorage

### 3. **Eliminación de Datos Hardcodeados**
Se eliminaron las constantes locales:
- ❌ `STICKER_POOL`
- ❌ `NO_PRIZE_STICKERS`
- ❌ `getRandomPrize()`

Ahora todo viene del API.

### 4. **Nuevas Funciones del API**

#### `openPackFromAPI()`
Llama a `POST /api/album/open-pack` y retorna:
```javascript
{
  album_id: "HN",
  user_id: "usuario123",
  pack_stickers: [/* 3 stickers */],
  total_prize_points: 200,
  prize_sticker: {/*...*/},
  remaining_stock: 149
}
```

#### `registerWinner(packData)`
Llama a `POST /api/album/register-winner` en segundo plano para registrar el pack abierto.

#### `startOpeningSequence()` - Actualizada
Ahora:
1. Muestra loader mientras carga
2. Llama al API para obtener stickers
3. Muestra animación de apertura
4. Renderiza los 3 stickers
5. Registra al ganador automáticamente

### 5. **Mejoras en UI**

#### Estado de Carga
```javascript
state.isLoading = true;  // Muestra "Abriendo..."
```

#### Visualización de Puntos Ganados
- Badge dorado con los puntos totales
- Etiqueta de puntos debajo del sticker premiado
- Formato con separadores de miles (ej: "20,000 pts")

#### Manejo de Errores
- Try/catch para errores de red
- Alert amigable al usuario
- Logs en consola para debugging

## 🎮 Flujo de Usuario

1. **Carga de página**
   - Se genera/recupera user_id
   - Se muestra el pack cerrado

2. **Usuario acepta términos**
   - Checkbox activa
   - Botón "¡Ábrelo!" se habilita

3. **Usuario hace clic en pack**
   - Muestra "Abriendo..." con spinner
   - Llama al API: `POST /api/album/open-pack`

4. **API responde con 3 stickers**
   - Animación de apertura del pack
   - Renderiza 3 stickers (2 sin premio + 1 premiado)
   - Muestra badge con puntos ganados

5. **Registro automático**
   - Llama a `POST /api/album/register-winner`
   - Se registra en base de datos
   - Stock se actualiza automáticamente

6. **Usuario continúa**
   - Botón "¡Obtener Más!" redirige a BEES

## 📊 Datos en Consola

Para debugging, se muestran logs:
```
🎮 Iniciando apertura de pack...
📡 Llamando al API...
✅ Pack recibido del API: {...}
🎨 Stickers procesados: [...]
📝 Registrando ganador...
```

## 🔧 Configuración para Otros Álbumes

Para crear versión de Guatemala (GT), duplicar archivo y cambiar:

```javascript
const ALBUM_ID = 'GT'; // Cambiar de 'HN' a 'GT'
```

Actualizar imagen del pack:
```html
<img src="https://mysiterobert.s3.us-east-1.amazonaws.com/BEES_2026/Album2026/GT/GT_CoverPageGame.png">
```

## 🌐 URLs de Integración

### Producción
```
https://api-cn.onrender.com/api/album/open-pack
https://api-cn.onrender.com/api/album/register-winner
```

### Parámetros URL Soportados
```
HN_album.html?user_id=usuario123
```

## 🧪 Testing

### 1. Test Local
Abrir el HTML en navegador y verificar console:
```javascript
// Debería mostrar:
user_id: "temp_1234567890_abc123"
```

### 2. Test con User ID
```
HN_album.html?user_id=test_user_001
```

### 3. Verificar Logs
En DevTools Console:
- ✅ Llamada al API
- ✅ Respuesta con stickers
- ✅ Registro de ganador

### 4. Verificar en Base de Datos
Usar endpoint de stats:
```bash
curl https://api-cn.onrender.com/api/album/stats/HN
```

## ⚠️ Consideraciones

### Performance
- El API está en Render.com (free tier)
- Puede tardar ~10s en primera carga (cold start)
- Solicitudes subsecuentes son rápidas

### Error Handling
- Si API falla, se muestra alert al usuario
- El pack no se "pierde" - puede intentar de nuevo
- Errores se logean en console para debugging

### Stock
- El stock se valida en el backend
- Si no hay stock, el API retorna error
- El HTML muestra el error al usuario

## 📱 Integración con Braze

Si se usa en Braze In-App Message:
1. El user_id se obtiene automáticamente de `appboyBridge`
2. Los clics se registran con `appboyBridge.logClick()`
3. El modal se cierra con `appboyBridge.closeMessage()`

## 🎯 Próximos Pasos

- [ ] Probar en Braze con user_id real
- [ ] Crear versiones para otros países (GT, SV, NI, etc.)
- [ ] Implementar caché de imágenes para mejor performance
- [ ] Agregar analytics de conversión
- [ ] A/B testing de probabilidades

## 📝 Notas Técnicas

### CORS
El API tiene CORS habilitado:
```javascript
app.use(cors());
```

### Formato de Datos
El API retorna stickers en formato:
```javascript
{
  sticker_id: "sv1",
  sticker_url: "https://...",
  prize_points: 200,
  brand: "sv",
  is_prize: true
}
```

El frontend los convierte a:
```javascript
{
  id: "sv1",
  url: "https://...",
  prize: 200,
  brand: "sv",
  isPrize: true
}
```

### Animaciones
Todas las animaciones CSS se mantienen:
- Shake effect del pack
- Pop animation de stickers
- Glow del sticker premiado
- Gold badge del premio

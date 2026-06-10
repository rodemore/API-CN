# 📊 Logs de Braze - Álbum HN

Todos los eventos de Braze implementados en `HN_album_FS.html`

---

## 🎯 Eventos Implementados

### 1. **Cerrar In-App Message** ✅
**Función:** `closeInApp()`
**Trigger:** Click en botón X (esquina superior derecha)

```javascript
appboyBridge.logClick('Cerrar Publicidad');
appboyBridge.closeMessage();
appboyBridge.logClick('Cerrar Inapp');
```

**Uso:** Cierra el modal y registra el evento de cierre.

---

### 2. **Ver Términos y Condiciones** ✅
**Función:** `toggleTermsModal(true)`
**Trigger:** Click en "Términos y Condiciones" (enlace)

```javascript
appboyBridge.logClick('Ver Términos y Condiciones');
```

**Uso:** Usuario abre el modal para leer términos.

---

### 3. **Aceptar Términos - Checkbox** ✅
**Función:** `toggleTerms()`
**Trigger:** Click en checkbox junto a términos

```javascript
// Cuando acepta:
appboyBridge.logClick('Términos Aceptados - Checkbox');

// Cuando rechaza:
appboyBridge.logClick('Términos Rechazados - Checkbox');
```

**Uso:** Usuario marca/desmarca el checkbox de aceptación.

---

### 4. **Aceptar Términos - Botón Modal** ✅
**Función:** `acceptTerms()`
**Trigger:** Click en "Acepto los Términos" (botón dentro del modal)

```javascript
appboyBridge.logClick('Términos Aceptados - Botón Modal');
```

**Uso:** Usuario acepta términos desde el modal.

---

### 5. **Abrir Pack** ✅
**Función:** `startOpeningSequence()`
**Trigger:** Click en la imagen del pack

```javascript
appboyBridge.logClick('Abrir Pack');
```

**Uso:** Usuario inicia el proceso de apertura del pack.

---

### 6. **Pack Abierto Exitosamente** ✅
**Función:** `startOpeningSequence()` (después de recibir respuesta del API)
**Trigger:** Automático cuando el API retorna los stickers

```javascript
// Click event con puntos ganados
appboyBridge.logClick(`Pack Abierto - ${prizePoints} pts`);

// Custom event con datos detallados
appboyBridge.logCustomEvent('Album Pack Opened', {
    album_id: packData.album_id,
    prize_points: prizePoints,
    prize_sticker: prizeName
});
```

**Ejemplos de eventos:**
- `Pack Abierto - 200 pts`
- `Pack Abierto - 1000 pts`
- `Pack Abierto - 20000 pts`

**Uso:** Trackea cada pack abierto con información del premio.

---

### 7. **Error al Abrir Pack** ✅
**Función:** `startOpeningSequence()` (catch block)
**Trigger:** Cuando falla la llamada al API

```javascript
// Click event de error
appboyBridge.logClick('Error al Abrir Pack');

// Custom event con detalles del error
appboyBridge.logCustomEvent('Album Pack Error', {
    error_message: error.message,
    album_id: ALBUM_ID
});
```

**Uso:** Trackea errores técnicos (API caído, sin conexión, etc.).

---

### 8. **Obtener Más Packs** ✅
**Función:** `finalAction()`
**Trigger:** Click en botón "¡Obtener Más!"

```javascript
appboyBridge.logClick('Obtener Más Packs');
```

**Uso:** Usuario hace clic para ir a BEES y obtener más packs (redirección).

---

## 📈 Custom Events (con propiedades)

### `Album Pack Opened`
**Propiedades:**
- `album_id`: String (ej: "HN")
- `prize_points`: Number (200, 1000, o 20000)
- `prize_sticker`: String (nombre del sticker)

**Ejemplo:**
```json
{
  "album_id": "HN",
  "prize_points": 1000,
  "prize_sticker": "Salva Vida Game 3"
}
```

---

### `Album Pack Error`
**Propiedades:**
- `error_message`: String (mensaje del error)
- `album_id`: String (ej: "HN")

**Ejemplo:**
```json
{
  "error_message": "Failed to fetch",
  "album_id": "HN"
}
```

---

## 🎪 Flujo Completo de Eventos

```
1. Usuario abre In-App Message
   └─> (ningún evento - automático de Braze)

2. Usuario ve términos
   └─> "Ver Términos y Condiciones"

3. Usuario acepta términos (checkbox)
   └─> "Términos Aceptados - Checkbox"

4. Usuario hace clic en pack
   └─> "Abrir Pack"

5. API retorna stickers
   └─> "Pack Abierto - 200 pts" (click)
   └─> "Album Pack Opened" (custom event)

6. Usuario quiere más packs
   └─> "Obtener Más Packs"
   └─> Redirige a BEES

7. Usuario cierra modal
   └─> "Cerrar Publicidad"
   └─> closeMessage()
   └─> "Cerrar Inapp"
```

---

## 🔍 Análisis Sugeridos en Braze

### 1. **Funnel de Conversión**
```
Impressions → Ver Términos → Aceptar → Abrir Pack → Éxito
```

**Métricas:**
- Tasa de aceptación de términos
- Tasa de apertura de packs
- Tasa de error

### 2. **Distribución de Premios**
Filtrar `Album Pack Opened` por `prize_points`:
- 200 pts → Debería ser ~75%
- 1000 pts → Debería ser ~23%
- 20000 pts → Debería ser ~2%

### 3. **Errores Técnicos**
Filtrar `Album Pack Error` por `error_message`:
- "Failed to fetch" → Problemas de red
- "No hay premios disponibles" → Stock agotado
- Otros errores → Problemas del API

### 4. **Engagement**
- Usuarios que abren términos pero no aceptan
- Usuarios que aceptan pero no abren pack
- Usuarios que abren pack y van a BEES

---

## 🧪 Testing

### Test Manual en Braze Preview:

1. **Test Términos:**
   - Click en "Términos y Condiciones" → Debe logear
   - Check/uncheck checkbox → Debe logear ambos
   - Click "Acepto los Términos" → Debe logear

2. **Test Apertura:**
   - Click en pack → Debe logear "Abrir Pack"
   - Esperar respuesta API → Debe logear "Pack Abierto - X pts"
   - Verificar custom event en Braze Dashboard

3. **Test Error:**
   - Desconectar WiFi → Abrir pack
   - Debe mostrar alert de error
   - Debe logear "Error al Abrir Pack"

4. **Test Cierre:**
   - Click en X → Debe cerrar modal
   - Debe logear "Cerrar Publicidad" y "Cerrar Inapp"

---

## 📊 Dashboard Recomendado

### Widgets Sugeridos:

1. **Total de Packs Abiertos**
   - Custom Event: `Album Pack Opened`
   - Timeframe: Last 30 days

2. **Distribución de Premios**
   - Custom Event: `Album Pack Opened`
   - Group by: `prize_points`
   - Chart: Pie chart

3. **Tasa de Error**
   - Custom Events: `Album Pack Opened` vs `Album Pack Error`
   - Formula: Errores / (Abiertos + Errores)

4. **Funnel de Usuario**
   - Step 1: In-App impressions
   - Step 2: "Ver Términos y Condiciones" clicks
   - Step 3: "Términos Aceptados" clicks
   - Step 4: "Abrir Pack" clicks
   - Step 5: "Album Pack Opened" events

---

## 🎯 Triggers de Campañas

### Ejemplo: Re-engagement si error

**Trigger:**
```
Custom Event: "Album Pack Error"
Where: error_message contains "Failed to fetch"
```

**Action:**
- Send push notification: "Parece que hubo un problema. ¡Intenta abrir tu pack de nuevo!"

### Ejemplo: Incentivo por premio bajo

**Trigger:**
```
Custom Event: "Album Pack Opened"
Where: prize_points = 200
```

**Action:**
- Send in-app: "¡Sigue jugando! Tienes oportunidad de ganar hasta 20,000 pts"

---

## ✅ Checklist de Verificación

Antes de lanzar campaña, verificar:

- [ ] Todos los clicks logean correctamente
- [ ] Custom events tienen propiedades correctas
- [ ] Botón de cerrar funciona (closeMessage)
- [ ] No hay logs duplicados
- [ ] Events aparecen en Braze Dashboard
- [ ] Funnel se ve correcto en analytics
- [ ] Error handling logea apropiadamente

---

## 🔧 Troubleshooting

### "Events no aparecen en Braze"
- Verificar que `appboyBridge` esté definido
- Check console para ver si se ejecutan los logs
- Confirmar que estás en preview mode con test user

### "Logs duplicados"
- Verificar que no hay múltiples listeners
- Confirmar que `e.stopPropagation()` está presente

### "closeMessage() no funciona"
- Asegurarse de estar en In-App Message (no push)
- Verificar que Braze SDK está inicializado

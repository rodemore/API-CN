# RuletaR API - Documentación Completa

API REST para el sistema de ruleta RuletaR con probabilidad configurable de ganar (50% por defecto).

## Información General

- **Servidor Base**: `https://api-cn.onrender.com`
- **Base Path**: `/api/ruletaR`
- **ID_RULETA**: `3` (identificador único de RuletaR)
- **Probabilidad de Ganar**: 50% por giro (configurable)
- **Total Premios**: 4,661 unidades

## Premios Disponibles

| ID_PREMIO | Premio                              | Stock |
|-----------|-------------------------------------|-------|
| 301       | Canasta navideñas + 01 vale de pavo| 10    |
| 302       | Laptops                             | 4     |
| 303       | Smart TV                            | 4     |
| 304       | Refrigeradora                       | 2     |
| 305       | 50,000 puntos                       | 1     |
| 306       | 20,000 puntos                       | 20    |
| 307       | 10,000 puntos                       | 40    |
| 308       | 5,000 puntos                        | 80    |
| 309       | 1,000 puntos                        | 4,500 |

---

## Endpoints

### 1. Girar la Ruleta (Spin)

Ejecuta un giro de la ruleta con 50% de probabilidad de ganar (configurable).

**Endpoint**: `POST /api/ruletaR/spin`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/spin`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "roulette_id": 3
}
```

#### Responses

**Caso 1: Ganó un premio** (Status: 200)
```json
{
  "success": true,
  "winner": true,
  "message": "¡Felicidades! Has ganado un premio",
  "prize": {
    "id": 309,
    "name": "1,000 puntos",
    "roulette_id": 3,
    "remainingStock": 4499
  }
}
```

**Caso 2: No ganó** (Status: 200)
```json
{
  "success": true,
  "winner": false,
  "message": "No ganaste esta vez. ¡Sigue intentando!"
}
```

**Caso 3: Sin stock disponible** (Status: 200)
```json
{
  "success": true,
  "winner": false,
  "message": "Lo sentimos, no hay premios disponibles en este momento"
}
```

**Caso 4: Error - falta roulette_id** (Status: 400)
```json
{
  "success": false,
  "message": "roulette_id is required"
}
```

**Caso 5: Error del servidor** (Status: 500)
```json
{
  "success": false,
  "message": "Error al girar la ruleta",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
curl -X POST https://api-cn.onrender.com/api/ruletaR/spin \
  -H "Content-Type: application/json" \
  -d '{"roulette_id": 3}'
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
const response = await fetch('https://api-cn.onrender.com/api/ruletaR/spin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    roulette_id: 3
  })
});

const data = await response.json();

if (data.success && data.winner) {
  console.log(`¡Ganaste! Premio: ${data.prize.name}`);
  console.log(`ID del premio: ${data.prize.id}`);
  console.log(`Stock restante: ${data.prize.remainingStock}`);
} else {
  console.log(data.message);
}
```

---

### 2. Registrar Ganador

Registra un ganador o participante en la base de datos y actualiza el contador de ganadores.

**Endpoint**: `POST /api/ruletaR/winner`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/winner`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body (Ganador):**
```json
{
  "user_id": "user_12345",
  "prize": "1,000 puntos",
  "prize_id": 309,
  "roulette_id": 3,
  "is_winner": true
}
```

**Body (Participante que no ganó):**
```json
{
  "user_id": "user_12345",
  "prize": "Sin premio",
  "prize_id": "no_winner",
  "roulette_id": 3,
  "is_winner": false
}
```

#### Campos

| Campo       | Tipo    | Requerido | Descripción                                    |
|-------------|---------|-----------|------------------------------------------------|
| user_id     | string  | Sí        | ID único del usuario                           |
| prize       | string  | Sí        | Nombre del premio ganado                       |
| prize_id    | number/string | Sí  | ID del premio (usar "no_winner" si no ganó)   |
| roulette_id | number  | Sí        | Debe ser 3 para RuletaR                       |
| is_winner   | boolean | No        | true si ganó, false si no (default: true)     |

#### Responses

**Caso 1: Ganador registrado exitosamente** (Status: 200)
```json
{
  "success": true,
  "message": "Ganador registrado exitosamente",
  "data": {
    "winner_id": "676f8a9b123456789abcdef0",
    "user_id": "user_12345",
    "prize": "1,000 puntos",
    "prize_id": 309,
    "roulette_id": 3,
    "is_winner": true,
    "created_at": "2026-10-07T12:30:45.123Z",
    "remainingStock": 4499
  }
}
```

**Caso 2: Participante registrado (no ganador)** (Status: 200)
```json
{
  "success": true,
  "message": "Participación registrada exitosamente",
  "data": {
    "winner_id": "676f8a9b123456789abcdef1",
    "user_id": "user_12345",
    "prize": "Sin premio",
    "prize_id": "no_winner",
    "roulette_id": 3,
    "is_winner": false,
    "created_at": "2026-10-07T12:30:45.123Z",
    "remainingStock": null
  }
}
```

**Caso 3: Error - campos faltantes** (Status: 400)
```json
{
  "success": false,
  "message": "user_id, prize, prize_id, and roulette_id are required"
}
```

**Caso 4: Error - premio no encontrado** (Status: 404)
```json
{
  "success": false,
  "message": "Prize not found"
}
```

**Caso 5: Error - sin stock** (Status: 400)
```json
{
  "success": false,
  "message": "No hay stock disponible para este premio"
}
```

**Caso 6: Error del servidor** (Status: 500)
```json
{
  "success": false,
  "message": "Error al registrar ganador",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
# Registrar ganador
curl -X POST https://api-cn.onrender.com/api/ruletaR/winner \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_12345",
    "prize": "1,000 puntos",
    "prize_id": 309,
    "roulette_id": 3,
    "is_winner": true
  }'
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
// Después de un spin ganador
const spinResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/spin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ roulette_id: 3 })
});

const spinData = await spinResponse.json();

if (spinData.success && spinData.winner) {
  // Registrar al ganador
  const winnerResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'user_12345',
      prize: spinData.prize.name,
      prize_id: spinData.prize.id,
      roulette_id: 3,
      is_winner: true
    })
  });

  const winnerData = await winnerResponse.json();
  console.log('Ganador registrado:', winnerData);
} else {
  // Registrar participante que no ganó
  const participantResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'user_12345',
      prize: 'Sin premio',
      prize_id: 'no_winner',
      roulette_id: 3,
      is_winner: false
    })
  });

  const participantData = await participantResponse.json();
  console.log('Participación registrada:', participantData);
}
```

---

### 3. Aceptar Términos y Condiciones

Registra la aceptación de términos y condiciones por parte del usuario.

**Endpoint**: `POST /api/ruletaR/terms`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/terms`

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userid": "user_12345",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0..."
}
```

#### Campos

| Campo       | Tipo   | Requerido | Descripción                          |
|-------------|--------|-----------|--------------------------------------|
| userid      | string | Sí        | ID único del usuario                 |
| ip_address  | string | No        | Dirección IP del usuario             |
| user_agent  | string | No        | User Agent del navegador             |

#### Responses

**Caso 1: Términos aceptados exitosamente** (Status: 200)
```json
{
  "success": true,
  "message": "Términos y condiciones aceptados exitosamente",
  "data": {
    "acceptance_id": "676f8a9b123456789abcdef0",
    "userid": "user_12345",
    "campaign": "RuletaR",
    "accepted_at": "2026-10-07T12:30:45.123Z"
  }
}
```

**Caso 2: Usuario ya aceptó términos** (Status: 200)
```json
{
  "success": true,
  "message": "Usuario ya aceptó los términos y condiciones",
  "data": {
    "acceptance_id": "676f8a9b123456789abcdef0",
    "userid": "user_12345",
    "campaign": "RuletaR",
    "accepted_at": "2026-10-06T10:15:30.456Z"
  }
}
```

**Caso 3: Error - userid faltante** (Status: 400)
```json
{
  "success": false,
  "message": "userid is required"
}
```

**Caso 4: Error del servidor** (Status: 500)
```json
{
  "success": false,
  "message": "Error al aceptar términos y condiciones",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
curl -X POST https://api-cn.onrender.com/api/ruletaR/terms \
  -H "Content-Type: application/json" \
  -d '{
    "userid": "user_12345",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
  }'
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
const response = await fetch('https://api-cn.onrender.com/api/ruletaR/terms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userid: 'user_12345',
    ip_address: window.location.hostname, // o usar API para obtener IP
    user_agent: navigator.userAgent
  })
});

const data = await response.json();

if (data.success) {
  console.log('Términos aceptados:', data.data);
}
```

---

### 4. Obtener Estadísticas

Obtiene estadísticas de premios y ganadores de RuletaR.

**Endpoint**: `GET /api/ruletaR/stats`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/stats`

#### Request

No requiere parámetros.

#### Response

**Success** (Status: 200)
```json
{
  "success": true,
  "winProbability": "50%",
  "totalWinners": 523,
  "prizes": [
    {
      "id": 301,
      "name": "Canasta navideñas + 01 vale de pavo",
      "totalStock": 10,
      "winners": 5,
      "available": 5
    },
    {
      "id": 302,
      "name": "Laptops",
      "totalStock": 4,
      "winners": 2,
      "available": 2
    },
    {
      "id": 303,
      "name": "Smart TV",
      "totalStock": 4,
      "winners": 1,
      "available": 3
    },
    {
      "id": 304,
      "name": "Refrigeradora",
      "totalStock": 2,
      "winners": 1,
      "available": 1
    },
    {
      "id": 305,
      "name": "50,000 puntos",
      "totalStock": 1,
      "winners": 0,
      "available": 1
    },
    {
      "id": 306,
      "name": "20,000 puntos",
      "totalStock": 20,
      "winners": 10,
      "available": 10
    },
    {
      "id": 307,
      "name": "10,000 puntos",
      "totalStock": 40,
      "winners": 20,
      "available": 20
    },
    {
      "id": 308,
      "name": "5,000 puntos",
      "totalStock": 80,
      "winners": 40,
      "available": 40
    },
    {
      "id": 309,
      "name": "1,000 puntos",
      "totalStock": 4500,
      "winners": 444,
      "available": 4056
    }
  ]
}
```

**Error** (Status: 500)
```json
{
  "success": false,
  "message": "Error al obtener estadísticas",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
curl -X GET https://api-cn.onrender.com/api/ruletaR/stats
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
const response = await fetch('https://api-cn.onrender.com/api/ruletaR/stats');
const data = await response.json();

if (data.success) {
  console.log(`Probabilidad de ganar: ${data.winProbability}`);
  console.log(`Total de ganadores: ${data.totalWinners}`);

  data.prizes.forEach(prize => {
    console.log(`${prize.name}: ${prize.available}/${prize.totalStock} disponibles`);
  });
}
```

---

### 5. Descargar Ganadores (Excel)

Descarga un archivo Excel con todos los ganadores de RuletaR.

**Endpoint**: `GET /api/ruletaR/winners/download`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/winners/download`

#### Request

No requiere parámetros.

#### Response

**Success** (Status: 200)
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="ganadores_ruletaR_YYYYMMDD_HHMM.xlsx"`
- **Body**: Archivo Excel binario

**Formato del Excel:**

| ID | Usuario (External ID) | Premio | ID Premio | ID Ruleta | Ganador | Fecha y Hora |
|----|-----------------------|--------|-----------|-----------|---------|--------------|
| 676f... | user_12345 | 1,000 puntos | 309 | 3 | Sí | 07/10/2026, 12:30:45 |
| 676f... | user_67890 | Laptops | 302 | 3 | Sí | 07/10/2026, 12:29:15 |
| ... | ... | ... | ... | ... | ... | ... |

**Error - sin ganadores** (Status: 404)
```json
{
  "success": false,
  "message": "No hay ganadores para descargar"
}
```

**Error del servidor** (Status: 500)
```json
{
  "success": false,
  "message": "Error al descargar ganadores",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
# Descargar directamente
curl -X GET https://api-cn.onrender.com/api/ruletaR/winners/download \
  -o ganadores_ruletaR.xlsx
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
// Descargar en el navegador
async function downloadWinners() {
  const response = await fetch('https://api-cn.onrender.com/api/ruletaR/winners/download');

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ganadores_ruletaR.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const error = await response.json();
    console.error('Error:', error.message);
  }
}

downloadWinners();
```

---

### 6. Descargar Aceptaciones de Términos (Excel)

Descarga un archivo Excel con todas las aceptaciones de términos y condiciones.

**Endpoint**: `GET /api/ruletaR/terms/download`

**URL Completa**: `https://api-cn.onrender.com/api/ruletaR/terms/download`

#### Request

No requiere parámetros.

#### Response

**Success** (Status: 200)
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition**: `attachment; filename="terminos_ruletaR_YYYYMMDD_HHMM.xlsx"`
- **Body**: Archivo Excel binario

**Formato del Excel:**

| ID | Usuario | Campaña | IP Address | User Agent | Fecha y Hora |
|----|---------|---------|------------|------------|--------------|
| 676f... | user_12345 | RuletaR | 192.168.1.1 | Mozilla/5.0... | 07/10/2026, 12:30:45 |
| 676f... | user_67890 | RuletaR | 192.168.1.2 | Mozilla/5.0... | 07/10/2026, 12:29:15 |
| ... | ... | ... | ... | ... | ... |

**Error - sin aceptaciones** (Status: 404)
```json
{
  "success": false,
  "message": "No hay aceptaciones de términos para descargar"
}
```

**Error del servidor** (Status: 500)
```json
{
  "success": false,
  "message": "Error al descargar aceptaciones de términos",
  "error": "Descripción del error"
}
```

#### Ejemplo de Uso (cURL)

```bash
# Descargar directamente
curl -X GET https://api-cn.onrender.com/api/ruletaR/terms/download \
  -o terminos_ruletaR.xlsx
```

#### Ejemplo de Uso (JavaScript/Fetch)

```javascript
// Descargar en el navegador
async function downloadTerms() {
  const response = await fetch('https://api-cn.onrender.com/api/ruletaR/terms/download');

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminos_ruletaR.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const error = await response.json();
    console.error('Error:', error.message);
  }
}

downloadTerms();
```

---

## Flujo Completo de Uso

### Flujo Recomendado

```javascript
async function jugarRuletaR(userId) {
  try {
    // 1. Verificar/Aceptar términos y condiciones
    const termsResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userid: userId,
        ip_address: '192.168.1.1', // Obtener IP real
        user_agent: navigator.userAgent
      })
    });

    const termsData = await termsResponse.json();
    console.log('Términos:', termsData.message);

    // 2. Ejecutar el giro
    const spinResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roulette_id: 3 })
    });

    const spinData = await spinResponse.json();

    if (!spinData.success) {
      throw new Error(spinData.message);
    }

    // 3. Registrar el resultado
    let registroData;

    if (spinData.winner) {
      // Usuario ganó
      console.log(`¡Felicidades! Ganaste: ${spinData.prize.name}`);

      const registroResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          prize: spinData.prize.name,
          prize_id: spinData.prize.id,
          roulette_id: 3,
          is_winner: true
        })
      });

      registroData = await registroResponse.json();

    } else {
      // Usuario no ganó
      console.log('No ganaste esta vez. ¡Sigue intentando!');

      const registroResponse = await fetch('https://api-cn.onrender.com/api/ruletaR/winner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          prize: 'Sin premio',
          prize_id: 'no_winner',
          roulette_id: 3,
          is_winner: false
        })
      });

      registroData = await registroResponse.json();
    }

    console.log('Registro completado:', registroData);
    return { terms: termsData, spin: spinData, registro: registroData };

  } catch (error) {
    console.error('Error en el flujo:', error);
    throw error;
  }
}

// Usar la función
jugarRuletaR('user_12345');
```

---

## Notas Importantes

### IDs de Ruleta
- **RuletaR**: ID_RULETA = `3`
- **Roulette**: ID_RULETA = `1`
- **Domino**: ID_RULETA = `2`
- **Album**: ID_RULETA = `4`
- **RuletaPY**: ID_RULETA = `5`
- **Milex**: ID_RULETA = `6`

### IDs de Premios RuletaR
- `301`: Canasta navideñas + 01 vale de pavo (10 unidades)
- `302`: Laptops (4 unidades)
- `303`: Smart TV (4 unidades)
- `304`: Refrigeradora (2 unidades)
- `305`: 50,000 puntos (1 unidad)
- `306`: 20,000 puntos (20 unidades)
- `307`: 10,000 puntos (40 unidades)
- `308`: 5,000 puntos (80 unidades)
- `309`: 1,000 puntos (4,500 unidades)

### Probabilidad de Selección de Premios

La selección de premios cuando un usuario gana se basa en **probabilidad ponderada** por stock disponible:

- Mayor stock disponible = Mayor probabilidad de ser seleccionado
- Menor stock disponible = Menor probabilidad de ser seleccionado

**Ejemplo:**
- 1,000 puntos (4,500 stock) tiene ~96.5% de probabilidad de salir
- 50,000 puntos (1 stock) tiene ~0.02% de probabilidad de salir
- Refrigeradora (2 stock) tiene ~0.04% de probabilidad de salir

### Manejo de Stock

- El stock **NO se decrementa directamente**
- Se incrementa el contador `GANADORES`
- Stock disponible = `Stock - GANADORES`
- Cuando `Stock - GANADORES <= 0`, el premio ya no está disponible

### Validaciones Importantes

1. **roulette_id siempre debe ser 3** para RuletaR
2. **prize_id debe ser numérico** (301-309) para ganadores
3. **userid es obligatorio** para aceptar términos
4. **user_id es obligatorio** para registrar ganadores/participantes
5. **is_winner** determina si se descuenta del stock (true) o no (false)

### Códigos de Error HTTP

- `200`: Operación exitosa
- `400`: Error en los datos enviados (campos faltantes, validación fallida)
- `404`: Recurso no encontrado (premio no existe, sin ganadores/términos)
- `500`: Error interno del servidor

---

## Ambiente de Producción

### Servidor
- **URL**: `https://api-cn.onrender.com`
- **Plataforma**: Render.com
- **Base de Datos**: MongoDB

### Variables de Entorno
```bash
RULETAR_PROBABILITY=0.50  # 50% de probabilidad
MONGODB_URI=mongodb://...
```

### Cambiar Probabilidad

Para modificar la probabilidad de ganar, actualizar la variable de entorno `RULETAR_PROBABILITY`:

```bash
# 50% de probabilidad (por defecto)
RULETAR_PROBABILITY=0.50

# 80% de probabilidad
RULETAR_PROBABILITY=0.80

# 30% de probabilidad
RULETAR_PROBABILITY=0.30
```

### Health Check
```bash
curl https://api-cn.onrender.com/health
```

---

## Comandos de Administración

### Cargar Stock Inicial

```bash
npm run load-ruletaR
```

Este comando:
1. Conecta a MongoDB
2. Elimina premios anteriores de RuletaR (ID_RULETA: 3)
3. Carga los 9 premios desde `Files/PremiosRuletaR.xlsx`
4. Muestra un resumen del stock cargado

### Ver Stock en Base de Datos

```javascript
// Conectar a MongoDB y consultar
db.stocks.find({ ID_RULETA: 3 })
```

---

## Soporte y Contacto

Para problemas técnicos o consultas sobre la API, contactar al equipo de desarrollo.

**Última actualización**: Octubre 7, 2026
**Versión**: 1.0.0

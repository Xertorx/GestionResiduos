# 🌱 API de Eco Puntos

**Base URL:** `http://localhost:8080/api/ecopoints`

---

## Modelo de datos

| Campo            | Tipo       | Obligatorio | Descripción                                      |
|------------------|------------|:-----------:|--------------------------------------------------|
| `id`             | Long       | Auto        | Identificador único (generado automáticamente)   |
| `name`           | String     | ✅          | Nombre del eco punto                             |
| `address`        | String     | ✅          | Dirección física                                 |
| `latitude`       | Double     | ✅          | Latitud geográfica                               |
| `longitude`      | Double     | ✅          | Longitud geográfica                              |
| `description`    | String     | ❌          | Descripción del eco punto                        |
| `status`         | String     | ✅          | Estado: `ACTIVO` o `INACTIVO`                    |
| `residueTypes`   | String[]   | ❌          | Tipos de residuo: `ORGANICO`, `RECICLABLE`, `ESPECIAL`, `RCD` |
| `neighborhood`   | Object     | ✅          | Objeto barrio (se envía con `neighborhoodId`)    |
| `openingTime`    | String     | ❌          | Hora de apertura (formato `HH:mm`)               |
| `closingTime`    | String     | ❌          | Hora de cierre (formato `HH:mm`)                 |
| `createdAt`      | Date       | Auto        | Fecha de creación                                |
| `updatedAt`      | Date       | Auto        | Fecha de última actualización                    |

---

## Endpoints

### 1. Obtener todos los eco puntos

```
GET /api/ecopoints
```

**Respuesta:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "EcoPunto Centro",
    "address": "Calle 10 #5-20",
    "latitude": 4.6097,
    "longitude": -74.0817,
    "description": "Punto de reciclaje central",
    "status": "ACTIVO",
    "residueTypes": ["ORGANICO", "RECICLABLE"],
    "neighborhood": {
      "neighborhoodId": 1,
      "name": "Centro"
    },
    "openingTime": "08:00",
    "closingTime": "18:00",
    "createdAt": "2026-04-07",
    "updatedAt": "2026-04-07"
  }
]
```

---

### 2. Obtener eco puntos activos

```
GET /api/ecopoints/active
```

**Respuesta:** `200 OK` — Lista de eco puntos con `status = "ACTIVO"`.

---

### 3. Obtener eco punto por ID

```
GET /api/ecopoints/{id}
```

| Parámetro | Tipo | Ubicación | Descripción          |
|-----------|------|-----------|----------------------|
| `id`      | Long | Path      | ID del eco punto     |

**Respuestas:**
- `200 OK` — Eco punto encontrado.
- `404 Not Found` — No existe un eco punto con ese ID.

---

### 4. Obtener eco puntos por barrio

```
GET /api/ecopoints/neighborhood/{neighborhoodId}
```

| Parámetro        | Tipo    | Ubicación | Descripción       |
|------------------|---------|-----------|-------------------|
| `neighborhoodId` | Integer | Path      | ID del barrio     |

**Respuesta:** `200 OK` — Lista de eco puntos del barrio.

---

### 5. Obtener eco puntos activos por barrio

```
GET /api/ecopoints/neighborhood/{neighborhoodId}/active
```

| Parámetro        | Tipo    | Ubicación | Descripción       |
|------------------|---------|-----------|-------------------|
| `neighborhoodId` | Integer | Path      | ID del barrio     |

**Respuesta:** `200 OK` — Lista de eco puntos activos del barrio.

---

### 6. Obtener eco puntos por tipo de residuo

```
GET /api/ecopoints/residue-type/{residueType}
```

| Parámetro     | Tipo   | Ubicación | Descripción                                         |
|---------------|--------|-----------|-----------------------------------------------------|
| `residueType` | String | Path      | Tipo de residuo: `ORGANICO`, `RECICLABLE`, `ESPECIAL`, `RCD` |

**Respuesta:** `200 OK` — Lista de eco puntos que aceptan ese tipo de residuo.

---

### 7. Obtener eco puntos activos por tipo de residuo

```
GET /api/ecopoints/residue-type/{residueType}/active
```

| Parámetro     | Tipo   | Ubicación | Descripción        |
|---------------|--------|-----------|--------------------|
| `residueType` | String | Path      | Tipo de residuo    |

**Respuesta:** `200 OK` — Lista de eco puntos activos con ese tipo de residuo.

---

### 8. Obtener eco puntos por barrio y tipo de residuo

```
GET /api/ecopoints/neighborhood/{neighborhoodId}/residue-type/{residueType}
```

| Parámetro        | Tipo    | Ubicación | Descripción     |
|------------------|---------|-----------|-----------------|
| `neighborhoodId` | Integer | Path      | ID del barrio   |
| `residueType`    | String  | Path      | Tipo de residuo |

**Respuesta:** `200 OK` — Lista filtrada por barrio y tipo de residuo.

---

### 9. Obtener eco puntos activos por barrio y tipo de residuo

```
GET /api/ecopoints/neighborhood/{neighborhoodId}/residue-type/{residueType}/active
```

| Parámetro        | Tipo    | Ubicación | Descripción     |
|------------------|---------|-----------|-----------------|
| `neighborhoodId` | Integer | Path      | ID del barrio   |
| `residueType`    | String  | Path      | Tipo de residuo |

**Respuesta:** `200 OK` — Lista activa filtrada por barrio y tipo de residuo.

---

### 10. Crear un eco punto

```
POST /api/ecopoints
```

**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "name": "EcoPunto Norte",
  "address": "Carrera 15 #80-10",
  "latitude": 4.6650,
  "longitude": -74.0550,
  "description": "Punto ecológico zona norte",
  "status": "ACTIVO",
  "residueTypes": ["ORGANICO", "RECICLABLE", "ESPECIAL"],
  "neighborhood": {
    "neighborhoodId": 3
  },
  "openingTime": "07:00",
  "closingTime": "20:00"
}
```

**Respuestas:**
- `201 Created` — Eco punto creado exitosamente.
- `400 Bad Request` — Error de validación (campos obligatorios faltantes).

---

### 11. Actualizar un eco punto

```
PUT /api/ecopoints/{id}
```

| Parámetro | Tipo | Ubicación | Descripción      |
|-----------|------|-----------|------------------|
| `id`      | Long | Path      | ID del eco punto |

**Content-Type:** `application/json`

**Body:** Mismo formato que la creación. Solo se actualizan los campos enviados (los `null` se ignoran).

```json
{
  "name": "EcoPunto Norte Actualizado",
  "closingTime": "21:00"
}
```

**Respuestas:**
- `200 OK` — Eco punto actualizado.
- `404 Not Found` — No existe un eco punto con ese ID.

---

### 12. Cambiar estado de un eco punto

```
PATCH /api/ecopoints/{id}/status?status={nuevoEstado}
```

| Parámetro | Tipo   | Ubicación    | Descripción                    |
|-----------|--------|--------------|--------------------------------|
| `id`      | Long   | Path         | ID del eco punto               |
| `status`  | String | Query Param  | Nuevo estado: `ACTIVO` o `INACTIVO` |

**Ejemplo:**
```
PATCH /api/ecopoints/1/status?status=INACTIVO
```

**Respuestas:**
- `200 OK` — Estado actualizado.
- `404 Not Found` — No existe un eco punto con ese ID.

---

### 13. Eliminar un eco punto

```
DELETE /api/ecopoints/{id}
```

| Parámetro | Tipo | Ubicación | Descripción      |
|-----------|------|-----------|------------------|
| `id`      | Long | Path      | ID del eco punto |

**Respuestas:**
- `204 No Content` — Eliminado exitosamente.
- `404 Not Found` — No existe un eco punto con ese ID.

---

## Resumen rápido

| Método   | Endpoint                                                        | Descripción                                  |
|----------|-----------------------------------------------------------------|----------------------------------------------|
| `GET`    | `/api/ecopoints`                                                | Todos los eco puntos                         |
| `GET`    | `/api/ecopoints/active`                                         | Solo eco puntos activos                      |
| `GET`    | `/api/ecopoints/{id}`                                           | Eco punto por ID                             |
| `GET`    | `/api/ecopoints/neighborhood/{id}`                              | Por barrio                                   |
| `GET`    | `/api/ecopoints/neighborhood/{id}/active`                       | Activos por barrio                           |
| `GET`    | `/api/ecopoints/residue-type/{type}`                            | Por tipo de residuo                          |
| `GET`    | `/api/ecopoints/residue-type/{type}/active`                     | Activos por tipo de residuo                  |
| `GET`    | `/api/ecopoints/neighborhood/{id}/residue-type/{type}`          | Por barrio y tipo de residuo                 |
| `GET`    | `/api/ecopoints/neighborhood/{id}/residue-type/{type}/active`   | Activos por barrio y tipo de residuo         |
| `POST`   | `/api/ecopoints`                                                | Crear eco punto                              |
| `PUT`    | `/api/ecopoints/{id}`                                           | Actualizar eco punto                         |
| `PATCH`  | `/api/ecopoints/{id}/status`                                    | Cambiar estado                               |
| `DELETE` | `/api/ecopoints/{id}`                                           | Eliminar eco punto                           |


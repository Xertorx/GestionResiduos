# 📋 API de Reportes

**Base URL:** `http://localhost:8080/api/reports`

> ⚠️ **Autenticación requerida:** Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`.

---

## Modelo de datos

### Entidad `Report`

| Campo         | Tipo    | Obligatorio | Descripción                                                        |
|---------------|---------|:-----------:|--------------------------------------------------------------------|
| `id`          | Long    | Auto        | Identificador único (generado automáticamente)                     |
| `type`        | String  | ✅          | Tipo de reporte: `punto_critico` o `incumplimiento_calendario`     |
| `categoryId`  | Integer | ✅          | ID de categoría del reporte                                        |
| `description` | String  | ✅          | Descripción detallada del reporte                                  |
| `latitude`    | Double  | ✅*         | Latitud geográfica (obligatorio para `punto_critico`)              |
| `longitude`   | Double  | ✅*         | Longitud geográfica (obligatorio para `punto_critico`)             |
| `imageUrl`    | String  | ❌          | URL de la imagen adjunta (guardada en servidor)                    |
| `calendarId`  | Integer | ✅*         | ID de calendario (obligatorio para `incumplimiento_calendario`)    |
| `status`      | String  | Auto        | Estado: `pendiente`, `en_revision`, `resuelto`, `rechazado`        |
| `user`        | User    | Auto        | Usuario que creó el reporte (se obtiene del JWT)                   |
| `createdAt`   | Date    | Auto        | Fecha de creación                                                  |
| `updatedAt`   | Date    | Auto        | Fecha de última actualización                                      |
| `resolvedAt`  | Date    | Auto        | Fecha en que fue resuelto                                          |

### DTO de respuesta `ReportDTO`

| Campo        | Tipo    | Descripción                        |
|--------------|---------|----------------------------------  |
| `id`         | Long    | ID del reporte                     |
| `type`       | String  | Tipo de reporte                    |
| `categoryId` | Integer | ID de categoría                    |
| `description`| String  | Descripción                        |
| `latitude`   | Double  | Latitud                            |
| `longitude`  | Double  | Longitud                           |
| `imageUrl`   | String  | URL de la imagen                   |
| `calendarId` | Integer | ID de calendario                   |
| `status`     | String  | Estado actual                      |
| `userId`     | Long    | Documento del usuario que reportó  |
| `userName`   | String  | Nombre del usuario que reportó     |
| `createdAt`  | Date    | Fecha de creación                  |
| `updatedAt`  | Date    | Fecha de actualización             |
| `resolvedAt` | Date    | Fecha de resolución                |

### DTO de estadísticas `ReportStatisticsDTO`

| Campo                   | Tipo | Descripción                              |
|-------------------------|------|------------------------------------------|
| `total`                 | int  | Total de reportes                        |
| `pending`               | int  | Reportes pendientes                      |
| `inReview`              | int  | Reportes en revisión                     |
| `resolved`              | int  | Reportes resueltos                       |
| `rejected`              | int  | Reportes rechazados                      |
| `criticalPoints`        | int  | Reportes de tipo punto crítico           |
| `calendarNonCompliance` | int  | Reportes de incumplimiento de calendario |

---

## Endpoints

### 1. Crear un reporte

```
POST /api/reports
```

**Content-Type:** `multipart/form-data`

> El usuario se identifica automáticamente a través del token JWT. No se necesita enviar el `userId`.

**Campos del formulario:**

| Campo         | Tipo          | Obligatorio | Descripción                                                    |
|---------------|---------------|:-----------:|----------------------------------------------------------------|
| `type`        | String        | ✅          | `punto_critico` o `incumplimiento_calendario`                  |
| `categoryId`  | Integer       | ✅          | ID de la categoría                                             |
| `description` | String        | ✅          | Descripción del problema                                       |
| `latitude`    | Double        | ✅*         | Latitud (obligatorio para `punto_critico`)                     |
| `longitude`   | Double        | ✅*         | Longitud (obligatorio para `punto_critico`)                    |
| `image`       | File (binary) | ❌          | Imagen/foto del problema (obligatorio para `punto_critico`)    |
| `calendarId`  | Integer       | ✅*         | ID calendario (obligatorio para `incumplimiento_calendario`)   |
| `device`      | String        | ❌          | Dispositivo: `mobile` o `web`                                  |
| `ip`          | String        | ❌          | IP del usuario                                                 |

**Ejemplo con cURL (punto crítico):**

```bash
curl -X POST http://localhost:8080/api/reports \
  -H "Authorization: Bearer <TOKEN>" \
  -F "type=punto_critico" \
  -F "categoryId=1" \
  -F "description=Basura acumulada en la esquina" \
  -F "latitude=4.6097" \
  -F "longitude=-74.0817" \
  -F "image=@/ruta/a/foto.jpg"
```

**Respuesta:** `201 Created`

```json
{
  "id": 1,
  "type": "punto_critico",
  "categoryId": 1,
  "description": "Basura acumulada en la esquina",
  "latitude": 4.6097,
  "longitude": -74.0817,
  "imageUrl": "/uploads/reports/uuid_foto.jpg",
  "calendarId": null,
  "status": "pendiente",
  "userId": 1001234567,
  "userName": "Juan Pérez",
  "createdAt": "2026-04-07",
  "updatedAt": "2026-04-07",
  "resolvedAt": null
}
```

---

### 2. Obtener mis reportes (ciudadano)

```
GET /api/reports/my-reports
```

> Retorna únicamente los reportes del usuario autenticado (identificado por el JWT).

**Respuesta:** `200 OK`

```json
[
  {
    "id": 1,
    "type": "punto_critico",
    "categoryId": 1,
    "description": "Basura acumulada en la esquina",
    "status": "pendiente",
    "userId": 1001234567,
    "userName": "Juan Pérez",
    "createdAt": "2026-04-07",
    ...
  }
]
```

---

### 3. Obtener todos los reportes (admin)

```
GET /api/reports
```

**Respuesta:** `200 OK` — Lista de todos los reportes del sistema.

---

### 4. Obtener reportes pendientes (admin)

```
GET /api/reports/pending
```

**Respuesta:** `200 OK` — Lista de reportes con `status = "pendiente"`.

---

### 5. Obtener reporte por ID

```
GET /api/reports/{id}
```

| Parámetro | Tipo | Ubicación | Descripción     |
|-----------|------|-----------|-----------------|
| `id`      | Long | Path      | ID del reporte  |

**Respuesta:** `200 OK`

```json
{
  "id": 1,
  "type": "punto_critico",
  "categoryId": 1,
  "description": "Basura acumulada en la esquina",
  "latitude": 4.6097,
  "longitude": -74.0817,
  "imageUrl": "/uploads/reports/uuid_foto.jpg",
  "calendarId": null,
  "status": "pendiente",
  "userId": 1001234567,
  "userName": "Juan Pérez",
  "createdAt": "2026-04-07",
  "updatedAt": "2026-04-07",
  "resolvedAt": null
}
```

---

### 6. Obtener reportes por tipo

```
GET /api/reports/type/{type}
```

| Parámetro | Tipo   | Ubicación | Descripción                                                |
|-----------|--------|-----------|------------------------------------------------------------|
| `type`    | String | Path      | `punto_critico` o `incumplimiento_calendario`              |

**Respuesta:** `200 OK` — Lista de reportes filtrados por tipo.

---

### 7. Obtener reportes por estado

```
GET /api/reports/status/{status}
```

| Parámetro | Tipo   | Ubicación | Descripción                                                |
|-----------|--------|-----------|------------------------------------------------------------|
| `status`  | String | Path      | `pendiente`, `en_revision`, `resuelto`, `rechazado`        |

**Respuesta:** `200 OK` — Lista de reportes filtrados por estado.

---

### 8. Cambiar estado de un reporte (admin)

```
PATCH /api/reports/{id}/status?newStatus={nuevoEstado}
```

| Parámetro   | Tipo   | Ubicación    | Descripción                                          |
|-------------|--------|--------------|------------------------------------------------------|
| `id`        | Long   | Path         | ID del reporte                                       |
| `newStatus` | String | Query Param  | Nuevo estado: `en_revision`, `resuelto`, `rechazado` |

**Ejemplo:**
```
PATCH /api/reports/1/status?newStatus=en_revision
```

**Respuesta:** `200 OK`

```json
{
  "id": 1,
  "type": "punto_critico",
  "status": "en_revision",
  ...
}
```

---

### 9. Obtener estadísticas (admin)

```
GET /api/reports/statistics
```

**Respuesta:** `200 OK`

```json
{
  "total": 50,
  "pending": 20,
  "inReview": 10,
  "resolved": 15,
  "rejected": 5,
  "criticalPoints": 35,
  "calendarNonCompliance": 15
}
```

---

## Resumen rápido

| Método  | Endpoint                          | Rol        | Descripción                        |
|---------|-----------------------------------|------------|------------------------------------|
| `POST`  | `/api/reports`                    | Ciudadano  | Crear reporte (multipart/form-data)|
| `GET`   | `/api/reports/my-reports`         | Ciudadano  | Mis reportes                       |
| `GET`   | `/api/reports`                    | Admin      | Todos los reportes                 |
| `GET`   | `/api/reports/pending`            | Admin      | Reportes pendientes                |
| `GET`   | `/api/reports/{id}`               | Todos      | Reporte por ID                     |
| `GET`   | `/api/reports/type/{type}`        | Todos      | Reportes por tipo                  |
| `GET`   | `/api/reports/status/{status}`    | Todos      | Reportes por estado                |
| `PATCH` | `/api/reports/{id}/status`        | Admin      | Cambiar estado de reporte          |
| `GET`   | `/api/reports/statistics`         | Admin      | Estadísticas de reportes           |

---

## Estados del reporte (flujo)

```
pendiente → en_revision → resuelto
                       ↘ rechazado
```

## Tipos de reporte

| Tipo                           | Descripción                       | Campos requeridos extra              |
|--------------------------------|-----------------------------------|--------------------------------------|
| `punto_critico`                | Punto crítico de residuos         | `latitude`, `longitude`, `image`     |
| `incumplimiento_calendario`    | Incumplimiento en recolección     | `calendarId`                         |


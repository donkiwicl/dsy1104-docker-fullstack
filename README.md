# Docker Full Stack · DSY1104

Proyecto de referencia del mini curso de Docker de la asignatura DSY1104 (Full Stack 2).
Una aplicación de tareas con tres servicios que se levantan juntos con Docker Compose:

| Servicio | Tecnología | Carpeta |
| --- | --- | --- |
| `frontend` | React (Vite) servido por Nginx | `frontend/` |
| `backend` | Spring Boot 3 (Java 21) con API REST | `backend/` |
| `db` | MySQL 8.4 con volumen persistente | imagen oficial |

```text
Navegador ──▶ frontend (Nginx :80) ──/api──▶ backend (Spring Boot :8080) ──▶ db (MySQL :3306)
                                                                              └─ volumen db_data
```

## Requisitos

- Docker Engine o Docker Desktop, con el plugin Compose (`docker compose version`).
- Git.

No necesitas Java, Maven ni Node instalados para ejecutar el proyecto con Docker.

## Ejecutar en local

```bash
git clone <URL_DEL_REPOSITORIO>
cd dsy1104-docker-fullstack

cp .env.example .env      # edita las claves si quieres
docker compose up -d --build
docker compose ps
```

| Qué | URL |
| --- | --- |
| Aplicación (frontend) | http://localhost |
| API directa | http://localhost:8080/tareas |

Detener:

```bash
docker compose down        # conserva los datos
docker compose down -v     # borra también los datos (volumen db_data)
```

## Estructura

```text
.
├── backend/                  # API Spring Boot
│   ├── Dockerfile            # multi-stage: Maven -> JRE
│   ├── .dockerignore
│   ├── pom.xml
│   └── src/
├── frontend/                 # React + Vite
│   ├── Dockerfile            # multi-stage: Node -> Nginx
│   ├── nginx.conf            # try_files + reenvío de /api
│   ├── .dockerignore
│   └── src/
├── docker-compose.yml        # desarrollo / entrega (build)
├── docker-compose.prod.yml   # producción (imágenes del registry)
├── .env.example              # plantilla de variables (el .env real no se sube)
└── docs/                     # material del curso
```

## Variables de entorno

Se definen en `.env` (copia de `.env.example`) y Compose las inyecta en los contenedores.

| Variable | Uso |
| --- | --- |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_ROOT_PASSWORD` | Credenciales de MySQL y de la API |
| `BACKEND_PORT`, `FRONTEND_PORT` | Puertos publicados en tu máquina |
| `DOCKERHUB_USER`, `IMAGE_TAG` | Solo producción: usuario del registry y versión de las imágenes |

El backend lee `DB_URL`, `DB_USER` y `DB_PASSWORD` (ver `backend/src/main/resources/application.properties`).
`VITE_API_URL` se fija al **compilar** el frontend (por defecto `/api`).

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/tareas` | Lista las tareas |
| POST | `/tareas` | Crea una tarea `{"titulo": "...", "completada": false}` |
| PUT | `/tareas/{id}` | Actualiza una tarea |
| DELETE | `/tareas/{id}` | Elimina una tarea |

```bash
curl http://localhost:8080/tareas
curl -X POST http://localhost:8080/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Probar la API","completada":false}'
```

## Desarrollo sin Docker (opcional)

```bash
# Base de datos: levanta solo MySQL con Compose
docker compose up -d db   # agrega "ports: ['3306:3306']" al servicio db solo para este modo

# Backend
cd backend && DB_URL=jdbc:mysql://localhost:3306/appdb DB_USER=appuser DB_PASSWORD=... mvn spring-boot:run

# Frontend (el proxy de Vite reenvía /api a localhost:8080)
cd frontend && npm install && npm run dev
```

Los tests del backend usan H2 en memoria: `cd backend && mvn test`.

## Despliegue

1. Publica las imágenes (reemplaza `TU_USUARIO`):

   ```bash
   docker login
   docker build -t TU_USUARIO/tareas-api:1.0 ./backend
   docker build -t TU_USUARIO/tareas-web:1.0 ./frontend
   docker push TU_USUARIO/tareas-api:1.0
   docker push TU_USUARIO/tareas-web:1.0
   ```

2. En el servidor (con Docker y Compose instalados), copia `docker-compose.prod.yml` y crea un `.env` con
   claves de producción, `DOCKERHUB_USER` e `IMAGE_TAG`:

   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   docker compose -f docker-compose.prod.yml ps
   ```

3. Respaldo de la base de datos:

   ```bash
   docker compose -f docker-compose.prod.yml exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" $MYSQL_DATABASE' > respaldo.sql
   ```

En producción solo se publica el puerto 80 (Nginx). La base de datos y el backend no quedan expuestos.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `Connection refused` a la base de datos | URL con `localhost` o arranque anticipado | Usar `db` como host (ya configurado) y esperar el healthcheck |
| `port is already allocated` | Puerto ocupado en tu PC | Cambiar `FRONTEND_PORT` / `BACKEND_PORT` en `.env` |
| `Access denied for user` | Cambiaste las claves con el volumen ya creado | `docker compose down -v` y volver a levantar (borra datos) |
| Los cambios no aparecen | Caché de capas | `docker compose build --no-cache && docker compose up -d` |
| `permission denied` al usar `docker` | Usuario fuera del grupo `docker` | `sudo usermod -aG docker $USER` y reiniciar sesión |

## Material del curso

En `docs/` están la presentación del mini curso y el contenido en Markdown.

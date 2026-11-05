# Mini curso de Docker · DSY1104 (Full Stack 2)

Resumen del curso para tener junto al código. La presentación está en
[`presentacion-docker-dsy1104.pptx`](presentacion-docker-dsy1104.pptx) (también en PDF) y cada módulo
usa archivos reales de este repositorio.

## Objetivos

- Explicar imagen, contenedor, registry, volumen y red.
- Escribir un `Dockerfile` para Spring Boot y para React.
- Levantar frontend, backend y base de datos con Docker Compose.
- Manejar configuración y credenciales con variables de entorno.
- Publicar imágenes y desplegarlas en un servidor.

## Módulo 1 · Entorno

Necesitas Docker (Docker Desktop en Windows/macOS; Docker Engine en Linux), el plugin Compose y Git.

```bash
docker --version
docker compose version
docker run hello-world
```

En Linux, para usar Docker sin `sudo`: `sudo usermod -aG docker $USER` y volver a iniciar sesión.

## Módulo 2 · Conceptos

| Concepto | Qué es | En este proyecto |
| --- | --- | --- |
| Imagen | Plantilla de solo lectura | `tareas-api:1.0` |
| Contenedor | Instancia en ejecución de una imagen | La API en el puerto 8080 |
| Registry | Repositorio de imágenes | Docker Hub |
| Volumen | Almacenamiento que sobrevive al contenedor | `db_data` |
| Red | Conecta contenedores por nombre | El backend llega a `db` |

Dos reglas:

1. Un contenedor es desechable: lo que importa va en un volumen.
2. Dentro de un contenedor, `localhost` es el propio contenedor; para otro servicio se usa su nombre (`db`).

## Módulo 3 · Backend (`backend/Dockerfile`)

Construcción en dos etapas: Maven compila y un JRE liviano ejecuta el `.jar`. Copiar `pom.xml` antes de `src`
aprovecha la caché de dependencias. El contenedor corre con un usuario sin privilegios.

```bash
cd backend
docker build -t tareas-api:1.0 .
```

## Módulo 4 · Frontend (`frontend/Dockerfile`, `frontend/nginx.conf`)

React se compila a archivos estáticos y Nginx los sirve. `try_files` evita 404 al recargar rutas y `/api/`
se reenvía al backend por nombre de servicio. Las variables `VITE_*` se incrustan **al compilar**.

## Módulo 5 · Variables de entorno

- `.env` (real, no se sube a Git) y `.env.example` (plantilla, sí se sube).
- Spring Boot lee `DB_URL`, `DB_USER` y `DB_PASSWORD` en `application.properties`.
- Las variables de MySQL solo se aplican la primera vez, con el volumen vacío.
- Nunca pongas credenciales dentro de la imagen ni del `Dockerfile`.

## Módulo 6 · Docker Compose (`docker-compose.yml`)

```bash
docker compose up -d --build   # construir y levantar
docker compose ps              # estado
docker compose logs -f backend # logs
docker compose down            # apagar (conserva datos)
docker compose down -v         # apagar y borrar datos
```

`depends_on` con `condition: service_healthy` hace que el backend espere a que MySQL esté listo.

## Módulo 7 · Despliegue (`docker-compose.prod.yml`)

1. Publicar: `docker build`, `docker login` y `docker push` con etiqueta de versión.
2. Preparar el servidor: Docker + Compose, `.env` de producción, puerto 80 abierto.
3. Ejecutar:

   ```bash
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d
   ```

En producción solo se publica el puerto 80. Haz respaldos periódicos de la base con `mysqldump`.

## Módulo 8 · Depuración

1. `docker compose ps`: ¿qué servicio está caído?
2. `docker compose logs <servicio>`: lee el primer error, no el último.
3. `docker compose exec <servicio> sh`: revisa variables (`env`) y conectividad (`ping db`).

## Actividad práctica

- [ ] **A · Contenerizar:** `Dockerfile` multi-stage en backend y frontend, con `.dockerignore`.
- [ ] **B · Orquestar:** Compose con `db`, `backend`, `frontend` y volumen; `.env` fuera de Git.
- [ ] **C · Desplegar:** imágenes publicadas con etiqueta y aplicación corriendo en un servidor.
- [ ] **D · Documentar:** `README.md` para que otra persona levante la solución sola.

**Prueba final:** clona el repositorio en una carpeta nueva, copia `.env.example` a `.env`, ejecuta
`docker compose up -d --build` y verifica que todo funciona sin tocar nada más.

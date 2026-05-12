# Huellita — Mascotas Perdidas en Argentina

## Dominio
Plataforma web para reportar y encontrar mascotas perdidas en Argentina. Los usuarios publican reportes con foto, ubicación y datos de contacto, buscan en un mapa interactivo filtrado por especie/tamaño/zona, y marcan reportes como resueltos.

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend API | Fastify 4, TypeScript |
| Base de datos | PostgreSQL 16 + PostGIS (geolocalización) |
| Autenticación | Supabase Auth (JWT) |
| Storage de imágenes | Cloudflare R2 |
| Monorepo | pnpm workspaces |
| Tipos compartidos | `@huellita/shared` |

## Estructura del monorepo

```
apps/
  web/      → Next.js 14 frontend         (puerto 3000)
  api/      → Fastify REST API             (puerto 3001)
packages/
  shared/   → Tipos TypeScript compartidos
```

## Entidades principales

- **Report**: Reporte de mascota `lost` (perdida) o `found` (encontrada). Estado: `active | resolved | archived`.
- **Pet**: Datos de la mascota (especie, raza, color, tamaño, fotos). Embebida en el reporte.
- **Location**: Coordenadas + dirección. Almacenada como `geometry(Point, 4326)` en Postgres.
- **User**: Gestionado por Supabase Auth. Datos extra en tabla `profiles`.

## Convenciones

- IDs: UUID v4
- Fechas: ISO 8601 UTC como `string` en la API, `timestamptz` en la base de datos
- Coordenadas: GeoJSON estándar — orden `[lng, lat]`
- Errores de API: `{ error: string; code: string }`
- Variables de entorno: ver `.env.example` en cada app

## Comandos de desarrollo

```bash
pnpm dev          # Levanta web (3000) y api (3001) en paralelo
pnpm build        # Build de todos los workspaces
pnpm type-check   # Type checking en todos los workspaces
```

## Variables de entorno requeridas

**apps/api**: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`. En producción también `CORS_ORIGIN` (URL pública de la web) y `PORT` (Railway lo inyecta).

**apps/web**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Despliegue

### Frontend — Vercel (`apps/web`)

Config: `apps/web/vercel.json` (framework Next.js, install/build escalan al root para resolver workspaces).

Pasos en el dashboard de Vercel:
1. **New Project** → importar el repo de GitHub.
2. **Root Directory**: `apps/web` (clave para que tome `apps/web/vercel.json`).
3. **Framework Preset**: Next.js (autodetectado).
4. **Environment Variables**: `NEXT_PUBLIC_API_URL` (URL pública de Railway), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Deploy. Vercel ejecuta `pnpm install --frozen-lockfile` en el root, builda `@huellita/shared` y luego `@huellita/web`.

### Backend — Railway (`apps/api`)

Config: `apps/api/railway.json` + `apps/api/Dockerfile` (multi-stage: deps → build → runtime con sólo prod deps).

Pasos en el dashboard de Railway:
1. **New Project** → **Deploy from GitHub repo**.
2. En la pestaña **Settings** del servicio:
   - **Root Directory**: dejar vacío (el contexto del build debe ser el repo root para acceder a `pnpm-workspace.yaml` y `packages/shared`).
   - **Config-as-code Path**: `apps/api/railway.json`.
   - **Watch Paths**: `apps/api/**`, `packages/shared/**`, `pnpm-lock.yaml`.
3. **Variables**: `DATABASE_URL` (de la DB de Supabase con `?sslmode=require`), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `R2_*`, `CORS_ORIGIN` (URL de Vercel).
4. Railway expone `PORT` automáticamente; el server ya lo lee.
5. Deploy. El healthcheck pega contra `GET /health` y espera `{ status: "ok" }`.

### Build local del Dockerfile (debug)

```bash
docker build -f apps/api/Dockerfile -t huellita-api .
docker run --rm -p 3001:3001 --env-file apps/api/.env huellita-api
curl http://localhost:3001/health   # → {"status":"ok"}
```

### Migraciones en producción

`pnpm --filter @huellita/api migrate` corre el script `apps/api/scripts/migrate.ts`. En Railway se puede agregar como **release command** o ejecutar manualmente vía `railway run`.

## Estado actual (11 de mayo, 2026)
- Scaffolding completo: monorepo pnpm, apps/web y apps/api
- Endpoints REST implementados: POST/GET/PATCH /reports + GET /health
- Migraciones SQL listas (PostGIS): reports y zone_subscriptions
- Frontend MVP: mapa (/), formulario (/reportar) conectado al API real, detalle (/reporte/[id])
- `@huellita/shared` ahora compila a `dist/` (requerido para el runtime de Node en producción); `pnpm dev` lo builda antes de levantar las apps
- Configuración de despliegue lista: `apps/web/vercel.json`, `apps/api/Dockerfile`, `apps/api/railway.json`
- MCP de Supabase configurado en `.mcp.json` (ignorado en git)
- Próximo paso: crear proyectos en Vercel y Railway, cargar variables de entorno y desplegar

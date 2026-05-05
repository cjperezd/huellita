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

**apps/api**: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

**apps/web**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

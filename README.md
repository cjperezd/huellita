# Huellita

Plataforma web para reportar y encontrar mascotas perdidas en Argentina.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **API**: Fastify 4 + TypeScript
- **Base de datos**: PostgreSQL 16 + PostGIS
- **Auth**: Supabase Auth
- **Storage**: Cloudflare R2

## Estructura del monorepo

```
apps/
  web/        → Frontend Next.js (puerto 3000)
  api/        → API REST Fastify (puerto 3001)
packages/
  shared/     → Tipos TypeScript compartidos
```

## Requisitos

- Node.js >= 20
- pnpm >= 9

## Configuración inicial

1. Instalar dependencias:

```bash
pnpm install
```

2. Configurar variables de entorno:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Completar los valores en cada archivo `.env`.

3. Levantar el entorno de desarrollo:

```bash
pnpm dev
```

Esto levanta `apps/web` en `http://localhost:3000` y `apps/api` en `http://localhost:3001`.

## Comandos útiles

```bash
pnpm dev           # Levanta todos los servicios en paralelo
pnpm build         # Build de producción
pnpm type-check    # Verificación de tipos en todos los workspaces
pnpm lint          # Linting en todos los workspaces
```

## Contribuir

Ver [CLAUDE.md](./CLAUDE.md) para el contexto técnico completo del proyecto.

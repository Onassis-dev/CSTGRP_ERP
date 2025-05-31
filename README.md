# Custom ERP

## Description

This is a custom ERP I am building for the manufacturing company I work at. It is open source for learning purposes only, because this code is completely optimized for the company's specific needs. Feel free to ask questions about the project.

## Turborepo structure

```
iglesiasbc/
|
├── apps/
│   ├── app/
│   └── api/
|
├── package.json
```

## Stack

- **Frontend**: SvelteKit
- **Backend**: NestJS + Fastify
- **Global**: typescript, shadcn/ui, pnpm
- **Database**: PostgreSQL
- **Documentation**: Scalar, OpenAPI
- **Deployment**: Docker, Coolify

## Common Commands

```bash
# Desarrollo
    turbo dev
# Producción
    turbo build
```

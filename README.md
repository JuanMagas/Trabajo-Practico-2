# Clutch

Red social para compartir jugadas de Counter-Strike 2.
Trabajo Práctico N.º 2 de Programación IV, Tecnicatura Universitaria en Programación, UTN Avellaneda.

**Alumno:** Juan Manuel Magas

| | |
|---|---|
| Aplicación | `https://clutch-red-social.web.app` |
| API | `https://trabajo-practico-2-eosin.vercel.app` |

## Documentación

- [Informe funcional](docs/INFORME-FUNCIONAL.md): qué hace la aplicación y cómo se usa.
- [Informe técnico](docs/INFORME-TECNICO.md): arquitectura, API, modelo de datos y decisiones.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Front | Angular 22 (standalone, signals, zoneless), Chart.js, Service Worker (PWA) |
| Back | NestJS 12, Mongoose, class-validator, JWT, Multer |
| Datos | MongoDB Atlas |
| Imágenes | Cloudinary |
| Deploy | Firebase Hosting (front) y Vercel (back) |

## Estructura

```
Trabajo-Practico-2/
├── red-social-back/     API en NestJS
│   ├── src/
│   └── scripts/datos-prueba/   carga de datos ficticios
├── red-social-front/    Aplicación en Angular
│   └── src/app/
└── docs/                Informes y colección de Postman
```

## Cómo correrlo en local

Requisitos: Node 24 o superior y una base en MongoDB Atlas.

**Back**

```bash
cd red-social-back
npm install
npm run start:dev        # http://localhost:3000
```

Variables en `red-social-back/.env` (ver `.env.example`):

| Variable | Uso |
|---|---|
| `MONGO_URI` | Cadena de conexión de MongoDB Atlas |
| `JWT_SECRET` | Clave para firmar los tokens |
| `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` | Subida de imágenes |

**Front**

```bash
cd red-social-front
npm install
npx ng serve             # http://localhost:4200
```

El front usa `http://localhost:3000` en desarrollo y la URL de Vercel en producción (`src/environments`).

## Datos de prueba

Crea 6 usuarios, 14 publicaciones de CS2 (9 con imagen), comentarios y me gusta, con fechas repartidas en los últimos 21 días:

```bash
cd red-social-back
node --env-file=.env scripts/datos-prueba/cargar-datos.mjs http://localhost:3000
```

Contraseña de todos los usuarios de prueba: `Clutch2026`.

## Deploy

| | Cómo |
|---|---|
| Back | Vercel, conectado al repositorio. Root Directory: `red-social-back`. Variables de entorno iguales al `.env`. |
| Front | `npm run build` y `firebase deploy --only hosting` desde `red-social-front`. |

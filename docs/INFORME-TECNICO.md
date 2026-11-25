# Informe técnico · Clutch

## 1. Arquitectura

```
┌──────────────────────┐   HTTPS + JSON    ┌──────────────────────┐   Mongoose   ┌───────────────┐
│ Angular (Firebase)   │ ────────────────▶ │ NestJS (Vercel)      │ ───────────▶ │ MongoDB Atlas │
│ SPA + Service Worker │ ◀──────────────── │ API REST             │              └───────────────┘
└──────────────────────┘ Bearer <JWT>      └──────────┬───────────┘
                                                      │ upload_stream
                                                      ▼
                                               ┌──────────────┐
                                               │  Cloudinary  │
                                               └──────────────┘
```

- **Front:** SPA en Angular 22 con componentes standalone, signals y detección de cambios zoneless.
- **Back:** API REST en NestJS 12 (ESM), organizada en módulos.
- **Imágenes:** se reciben en memoria con Multer y se suben a Cloudinary; en la base se guarda solo la URL.

## 2. Back

### 2.1 Módulos

| Módulo | Contiene |
|---|---|
| `AppModule` | `ConfigModule` (global), conexión a Mongo (`forRootAsync`), `AuthenticationModule` (hash de contraseñas) |
| `AuthModule` | Registro, login, autorizar, refrescar, disponibilidad. `JwtModule` global. Registro de ingresos. |
| `UsuariosModule` | Esquema `Usuario`, `UsuariosService` (exportado) y `UsuariosController` (administración) |
| `PublicacionesModule` | Publicaciones, comentarios y estadísticas (tres controladores) |
| `FileModule` | `FileService`: validación y subida a Cloudinary |

### 2.2 Endpoints

**Sesión** = `SesionGuard` · **Admin** = `SesionGuard` + `AdminGuard`

| Método | Ruta | Acceso | Respuesta |
|---|---|---|---|
| POST | `/auth/registro` | Público | `201 { usuario, token }` · multipart con `fotoPerfil` |
| POST | `/auth/login` | Público | `200 { usuario, token }` · `401` si falla o está deshabilitado |
| GET | `/auth/disponible/:campo/:valor` | Público | `{ disponible }` · campo: `email` o `username` |
| POST | `/auth/autorizar` | Sesión | `200 { usuario }` |
| POST | `/auth/refrescar` | Sesión | `200 { token }` |
| GET | `/publicaciones?orden&usuario&offset&limit` | Sesión | `{ publicaciones, total }` |
| POST | `/publicaciones` | Sesión | `201` · multipart con `imagen` |
| GET | `/publicaciones/:id` | Sesión | Publicación con autor, me gusta y comentarios |
| DELETE | `/publicaciones/:id` | Sesión (autor o admin) | `204` · baja lógica · `403` si no es el autor |
| POST | `/publicaciones/:id/me-gusta` | Sesión | `201 { cantidadMeGusta, meGustaYo }` · `409` si ya lo dio |
| DELETE | `/publicaciones/:id/me-gusta` | Sesión | `200` · `409` si no lo había dado |
| GET | `/publicaciones/:id/comentarios?offset&limit` | Sesión | `{ comentarios, total }` |
| POST | `/publicaciones/:id/comentarios` | Sesión | `201` |
| PUT | `/publicaciones/:id/comentarios/:comentarioId` | Sesión (autor) | `200` con `modificado: true` |
| GET | `/usuarios` | Admin | Lista de usuarios |
| POST | `/usuarios` | Admin | `201` · registro más `perfil` |
| DELETE | `/usuarios/:id` | Admin | `204` · baja lógica · `400` si es la propia cuenta |
| POST | `/usuarios/:id/habilitar` | Admin | `204` |
| GET | `/estadisticas/publicaciones-por-usuario?desde&hasta` | Admin | `[{ username, cantidad }]` |
| GET | `/estadisticas/comentarios-por-dia?desde&hasta` | Admin | `[{ fecha, cantidad }]` |
| GET | `/estadisticas/comentarios-por-publicacion?desde&hasta` | Admin | `[{ titulo, cantidad }]` (top 10) |

**Códigos de error comunes:**

| Código | Cuándo |
|---|---|
| `400` | Validación fallida o id mal formado (`ParseObjectIdPipe`) |
| `401` | Sin token, token vencido o cuenta deshabilitada |
| `403` | Sin permiso |
| `404` | El recurso no existe o fue dado de baja |
| `409` | Duplicado (correo o usuario registrado, me gusta repetido) |

### 2.3 Modelo de datos

```
usuarios                      publicaciones                    comentarios
─────────────────             ─────────────────────            ─────────────────
_id                           _id                              _id
nombre, apellido              titulo        (≤100)             publicacion → publicaciones
email     (único)             mensaje       (≤1000)            autor       → usuarios
username  (único)             imagen        (URL)              mensaje     (≤500)
password  (hash scrypt)       autor  → usuarios (índice)       modificado  (bool)
fechaNacimiento               meGusta [{ usuario, fecha }]     createdAt, updatedAt
descripcion, fotoPerfil       activa        (baja lógica)
perfil  usuario|administrador createdAt, updatedAt             ingresos
activo  (baja lógica)                                          ─────────────────
createdAt, updatedAt                                           usuario → usuarios, fecha
```

- **`password` nunca sale en las respuestas:** el `toJSON` del esquema la elimina.
- **Me gusta embebidos:** son un subdocumento de la publicación. Guardan la fecha de cada uno y se agregan y quitan de forma atómica con `$push` / `$pull`, con la condición `$ne` para no duplicar.
- **Comentarios en su propia colección:** así se pueden paginar y filtrar por fecha sin cargar toda la publicación.

### 2.4 Seguridad

| Aspecto | Implementación |
|---|---|
| Contraseñas | `PasswordHasher` (scrypt) de `@nestjs/authentication` |
| Token | JWT firmado con `JWT_SECRET`, vence a los **15 minutos**, payload `{ sub, username, perfil }` |
| `SesionGuard` | Lee `Authorization: Bearer`, verifica el token y **vuelve a leer el usuario de la base** en cada pedido, así una baja o un cambio de perfil se aplica al instante |
| `AdminGuard` | Corre después del `SesionGuard`; si `perfil !== 'administrador'`, responde `403` |
| `@UsuarioActual()` | Decorador propio que entrega al controlador el usuario autenticado |
| Validación | `ValidationPipe` global con `whitelist` (descarta campos no declarados, por ejemplo un `perfil` enviado al registro público), `transform` y `stopAtFirstError` |
| Archivos | Solo imágenes, hasta 4 MB (Vercel rechaza cuerpos mayores a 4,5 MB) |

### 2.5 Consultas destacadas

- **Listado de publicaciones:** `aggregate` con `$match`, `$addFields` (cantidad de me gusta con `$size`, `meGustaYo` con `$in`), `$sort`, `$skip` y `$limit`, más un `$lookup` del autor. El total se obtiene con `countDocuments`.
- **Estadísticas:** `aggregate` con `$group`. Los comentarios por día se agrupan con `$dateToString` en la zona horaria `America/Argentina/Buenos_Aires`. Se excluyen los comentarios de publicaciones dadas de baja.

## 3. Front

### 3.1 Estructura de `src/app`

| Carpeta | Contenido |
|---|---|
| `paginas/` | Cargando, Login, Registro, Publicaciones, Publicación, Mi perfil, Usuarios, Estadísticas, No encontrada |
| `componentes/` | Layout principal, Tarjeta de publicación, Nueva publicación, Lista de comentarios, Comentario, Gráfico, Modal, Spinner |
| `servicios/` | `Sesion` (estado), y `Auth`, `PublicacionesApi`, `ComentariosApi`, `UsuariosApi`, `EstadisticasApi` (HTTP) |
| `guards/` | `sesionGuard`, `invitadoGuard`, `adminGuard` |
| `interceptores/` | `authInterceptor` |
| `pipes/` | `tiempoRelativo`, `edad`, `iniciales` |
| `directivas/` | `appMostrarClave`, `appAutoAltura`, `appAutofoco` |
| `validadores/` | `requisitosClave`, `clavesCoinciden`, `fechaPasada`, `disponible` (asincrónico) |

### 3.2 Rutas y guards

```
''                          Cargando
login, registro             invitadoGuard
''  (LayoutPrincipal)       sesionGuard
 ├─ publicaciones
 ├─ publicaciones/:id
 ├─ mi-perfil
 ├─ dashboard/usuarios          adminGuard
 ├─ dashboard/usuarios/nuevo    adminGuard   (Registro con data: { admin: true })
 └─ dashboard/estadisticas      adminGuard
'**'                        NoEncontrada
```

Todas las páginas se cargan con `loadComponent` (lazy loading).

### 3.3 Sesión

- **`Sesion`:** guarda usuario y token en signals y en `localStorage`. Lee el vencimiento (`exp`) del JWT y programa el aviso 5 minutos antes de que venza, es decir, a los 10 minutos.
- **`authInterceptor`:** agrega `Authorization: Bearer` solo a los pedidos al back propio. Ante un `401` fuera de login y registro, cierra la sesión y redirige al login con el motivo.
- **`sesionGuard`:** la primera vez valida el token con `/auth/autorizar`. Si el back no responde, cierra la sesión para no quedar en un bucle.

### 3.4 Elementos propios

| Tipo | Nombre | Función |
|---|---|---|
| Pipe | `tiempoRelativo` | `"hace 5 min"`, `"ayer"`, `"12 nov. 2026"` |
| Pipe | `edad` | Edad a partir de la fecha de nacimiento (en UTC, para no correr el día) |
| Pipe | `iniciales` | `"JM"` para avatares sin foto |
| Directiva | `appMostrarClave` | Alterna `type` password/text del input asociado |
| Directiva | `appAutoAltura` | El `textarea` crece con el contenido |
| Directiva | `appAutofoco` | Enfoca el campo al aparecer y ubica el cursor al final |
| Validador | `disponibleValidator` | Asincrónico, consulta `/auth/disponible` al salir del campo (`updateOn: 'blur'`) |

### 3.5 Gráficos

- **`Grafico`:** componente que envuelve Chart.js. Recibe la configuración por `input()` y, con un `effect`, destruye y vuelve a crear el gráfico cuando cambian los datos.
- **Pedidos en paralelo:** la página pide las tres estadísticas con `forkJoin`.
- **Paleta:** colores categóricos verificados para daltonismo sobre el fondo oscuro.

### 3.6 PWA

- **`@angular/service-worker`:** solo en producción (`enabled: !isDevMode()`).
- **`manifest.webmanifest`:** nombre, colores e íconos de Clutch.
- **`ngsw-config.json`:** la app se precarga (`prefetch`); imágenes y fuentes de Google se guardan a medida que se usan (`lazy`).

## 4. Decisiones

| Decisión | Motivo |
|---|---|
| Token en la respuesta y en `localStorage` (no en cookies) | Front y back están en dominios distintos (Firebase y Vercel); evita configurar cookies cross-site |
| `forRootAsync` / `registerAsync` con `ConfigService` | En `@nestjs/config` 12 el `.env` se carga de forma asincrónica |
| `void bootstrap()` en `main.ts` | Con `await` de nivel superior, la función de Vercel quedaba colgada hasta el timeout |
| `collection` explícito en los esquemas | Mongoose pluraliza agregando "s" (`publicacions`) |
| Baja lógica (`activa`, `activo`) | Lo pide el enunciado y conserva el historial para estadísticas |
| Un mismo componente para registro y alta de usuarios | Mismos campos y validaciones; la ruta indica el modo con `data` |

## 5. Pruebas

- **Colección de Postman (`docs/postman`):** 45 peticiones en 8 carpetas, con aserciones de código de estado y variables encadenadas (token e ids). Se ejecuta completa con *Run collection*.
- **Datos de prueba:** `red-social-back/scripts/datos-prueba/cargar-datos.mjs`.

## 6. Deploy

| | Plataforma | Configuración |
|---|---|---|
| Back | Vercel | Root Directory `red-social-back`; variables `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*` |
| Front | Firebase Hosting | `public: dist/red-social-front/browser`, rewrite de todas las rutas a `index.html` |
| Base | MongoDB Atlas | Acceso de red `0.0.0.0/0` (Vercel no tiene IP fija) |

# Informe funcional · Clutch

## 1. Descripción

Clutch es una red social para jugadores de Counter-Strike 2. Los usuarios publican sus jugadas con texto e imagen, dan me gusta y comentan las de otros. Los administradores gestionan usuarios, pueden dar de baja cualquier publicación y consultan estadísticas de uso.

## 2. Perfiles

| Perfil | Puede |
|---|---|
| Visitante | Registrarse e iniciar sesión |
| Usuario | Publicar, comentar, editar sus comentarios, dar y quitar me gusta, eliminar sus publicaciones, ver su perfil |
| Administrador | Todo lo anterior, y además: eliminar cualquier publicación, gestionar usuarios y ver estadísticas |

## 3. Pantallas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/` | Cargando | Todos |
| `/login` | Iniciar sesión | Sin sesión |
| `/registro` | Crear cuenta | Sin sesión |
| `/publicaciones` | Listado de publicaciones | Con sesión |
| `/publicaciones/:id` | Publicación y comentarios | Con sesión |
| `/mi-perfil` | Mi perfil | Con sesión |
| `/dashboard/usuarios` | Gestión de usuarios | Administrador |
| `/dashboard/usuarios/nuevo` | Alta de usuario | Administrador |
| `/dashboard/estadisticas` | Estadísticas | Administrador |
| `/**` | Página no encontrada | Todos |

## 4. Funcionalidades

### 4.1 Cargando

Al abrir la aplicación se muestra un spinner mientras se valida el token guardado contra el back.

- Token válido: va a Publicaciones.
- Token vencido o ausente: va a Login.

### 4.2 Registro

| Campo | Regla |
|---|---|
| Nombre y apellido | Obligatorios, hasta 50 caracteres |
| Correo | Obligatorio, formato válido, no registrado (se verifica al salir del campo) |
| Nombre de usuario | Obligatorio, 3 a 20 caracteres (letras, números, punto y guion bajo), no registrado |
| Contraseña | Mínimo 8 caracteres, al menos una mayúscula y un número |
| Repetir contraseña | Debe coincidir |
| Fecha de nacimiento | Obligatoria, no futura |
| Descripción | Opcional, hasta 200 caracteres |
| Foto de perfil | Opcional, imagen de hasta 4 MB, con vista previa |

Cada campo muestra su error al tocarlo, y el correo y el usuario indican si están disponibles. Al registrarse, la sesión queda iniciada.

### 4.3 Login

- Se ingresa con nombre de usuario **o** correo, más la contraseña.
- Con credenciales incorrectas se muestra "Usuario o contraseña incorrectos".
- Si la cuenta está deshabilitada, se muestra "Tu cuenta está deshabilitada".
- La contraseña tiene un botón para mostrarla u ocultarla.

### 4.4 Sesión

- La sesión dura **15 minutos**.
- A los 10 minutos aparece un aviso con dos opciones: **Extender sesión** (renueva otros 15 minutos) o **Ahora no**.
- Si una petición responde que la sesión no es válida, la aplicación vuelve al login con un aviso.

### 4.5 Publicaciones

| Acción | Detalle |
|---|---|
| Ver listado | 10 por página, con paginación |
| Ordenar | Por fecha (por defecto) o por cantidad de me gusta |
| Publicar | Título, mensaje y una imagen opcional |
| Me gusta | Se da y se quita con el mismo botón; uno por usuario |
| Eliminar | El autor puede eliminar las suyas; el administrador, cualquiera. Pide confirmación. |
| Abrir | El título o "N comentarios" llevan a la página de la publicación |

Una publicación eliminada deja de verse junto con sus comentarios. La baja es lógica: el dato queda guardado, pero oculto.

### 4.6 Publicación y comentarios

- La publicación se muestra en grande y, debajo, sus comentarios, del más reciente al más antiguo.
- Se cargan 5 comentarios; **Cargar más** trae los siguientes debajo, sin perder los anteriores.
- Cualquier usuario puede comentar.
- El autor de un comentario puede editarlo; el comentario editado muestra "· editado".

### 4.7 Mi perfil

Muestra:
- foto o iniciales, nombre, usuario, descripción, correo, fecha de nacimiento con la edad, antigüedad en la red y cantidad de publicaciones;
- las **últimas 3 publicaciones** del usuario, cada una con sus comentarios.

### 4.8 Gestión de usuarios (administrador)

- Listado de todos los usuarios con perfil y estado.
- **Nuevo usuario:** el mismo formulario que el registro, con dos opciones de perfil (*Usuario* o *Administrador*).
- **Deshabilitar** (pide confirmación) y **Habilitar**. El usuario deshabilitado no puede ingresar y se le informa al intentarlo.
- El administrador no puede deshabilitar su propia cuenta.

### 4.9 Estadísticas (administrador)

| Gráfico | Tipo | Muestra |
|---|---|---|
| Publicaciones por usuario | Torta | Cuántas publicó cada usuario en el período |
| Comentarios por día | Líneas | Comentarios realizados cada día del período |
| Comentarios por publicación | Barras | Las 10 publicaciones con más comentarios en el período |

- El período se elige con fechas *desde* y *hasta*, o con los atajos de 7, 30 y 90 días.
- Cada gráfico tiene una tabla con los datos ("Ver datos").

### 4.10 Aplicación instalable (PWA)

La aplicación puede instalarse desde el navegador ("Instalar app") y abre sin conexión con los archivos guardados en caché.

## 5. Mensajes al usuario

- **Éxito y error:** modales, por ejemplo al crear la cuenta o si falla una acción.
- **Confirmación:** modal antes de eliminar una publicación o deshabilitar un usuario.
- **Listas vacías:** mensaje con la acción sugerida, por ejemplo "Publicar mi primera jugada".

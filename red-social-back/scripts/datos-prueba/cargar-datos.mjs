// Carga datos de prueba de Clutch (CS2) usando la API del back.
//
// Uso (desde la carpeta red-social-back):
//   node --env-file=.env scripts/datos-prueba/cargar-datos.mjs http://localhost:3000
//   node --env-file=.env scripts/datos-prueba/cargar-datos.mjs https://trabajo-practico-2-eosin.vercel.app
//   (agregá --sin-imagenes al final para no subir nada a Cloudinary)
//
// 1. Registra 6 usuarios (si ya existen, inicia sesión).
// 2. Crea 14 publicaciones (9 con imagen), comentarios y me gusta.
// 3. Si encuentra MONGO_URI en el .env, reparte las fechas en los últimos 21 días
//    para que los gráficos de estadísticas muestren actividad en varios días.
//
// Contraseña de todos los usuarios: Clutch2026

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const SIN_IMAGENES = process.argv.includes('--sin-imagenes');
const CLAVE = 'Clutch2026';
const CARPETA_IMAGENES = join(dirname(fileURLToPath(import.meta.url)), 'imagenes');

const USUARIOS = [
  { username: 'ana.entry', nombre: 'Ana', apellido: 'Gómez', fechaNacimiento: '1998-04-21', descripcion: 'Entry de CS2. Main Mirage, odio Vertigo.' },
  { username: 'bruno.igl', nombre: 'Bruno', apellido: 'Ortiz', fechaNacimiento: '1996-11-02', descripcion: 'IGL de un 5 stack de amigos. Juego de noche.' },
  { username: 'fran.smokes', nombre: 'Francisco', apellido: 'Ojeda', fechaNacimiento: '2000-07-14', descripcion: 'Support. Me sé todas las smokes de Mirage e Inferno.' },
  { username: 'tomi.awp', nombre: 'Tomás', apellido: 'Vukovic', fechaNacimiento: '2002-01-30', descripcion: 'AWPer en proceso. 240 Hz y cero excusas.' },
  { username: 'meli.clutch', nombre: 'Melina', apellido: 'Paz', fechaNacimiento: '1999-09-08', descripcion: 'AWP y café. Buscando equipo para torneos.' },
  { username: 'santi.lurk', nombre: 'Santiago', apellido: 'Ruiz', fechaNacimiento: '1997-05-25', descripcion: 'Lurker profesional del rincón oscuro.' },
];

// autor: posición en USUARIOS · imagen: archivo de la carpeta imagenes (opcional)
const PUBLICACIONES = [
  { autor: 0, titulo: 'Ace con la Deagle en Inferno', mensaje: 'Eco total en el último round de la primera mitad y salió el ace en banana. Todavía me tiemblan las manos.', imagen: 'inferno-banana.jpg' },
  { autor: 4, titulo: 'Clutch 1v3 en Mirage B', mensaje: 'Me quedé sola en B con la AWP. Uno por apartamentos, uno en corto y el último en el sitio. 13-11 para nosotros.', imagen: 'mirage-b-clutch.jpg' },
  { autor: 2, titulo: 'Smoke de ventana desde T spawn', mensaje: 'Apuntá al borde de la antena, salto y tiro. Cae perfecta y corta la visión del AWP de mid. Practíquenla en un server local antes de usarla.', imagen: 'mirage-smoke-ventana.jpg' },
  { autor: 1, titulo: 'Buscamos support para el torneo del sábado', mensaje: 'Somos 4, nivel Premier 15k aprox. Necesitamos alguien que tire utilidad y hable en el chat de voz. Escriban acá abajo.' },
  { autor: 3, titulo: 'Por fin llegué a 20k de Premier', mensaje: 'Tres semanas de duo con Meli y lo logramos. Ahora a no bajar.', imagen: 'premier-20k.jpg' },
  { autor: 5, titulo: 'Retake 2v4 en Nuke sin utilidad', mensaje: 'Cero granadas, el C4 en rampa abajo y entramos por los dos lados al mismo tiempo. A veces sale.', imagen: 'nuke-retake.jpg' },
  { autor: 0, titulo: '¿Qué crosshair usan?', mensaje: 'Estoy probando uno chico, sin punto y de color celeste. ¿Ustedes con cuál juegan? Pasen sus códigos.' },
  { autor: 2, titulo: 'Molotov a default de Ancient', mensaje: 'Desde la esquina de la rampa, mirando a la punta del techo. Saca a cualquiera que esté plantando o defuseando.', imagen: 'ancient-molotov.jpg' },
  { autor: 3, titulo: 'Setup nuevo: 240 Hz', mensaje: 'Cambié el monitor después de cinco años. La diferencia en los flicks es real, no es placebo.' },
  { autor: 5, titulo: 'Ninja defuse en Overpass', mensaje: 'Se fueron todos a cubrir el pilar y yo estaba debajo de la bomba. Defuse con 0,3 segundos de sobra.', imagen: 'overpass-ninja.jpg' },
  { autor: 4, titulo: 'Dejen de peekear la AWP en mid', mensaje: 'Consejo gratis: si ven el AWP en mid, tiren una smoke o crucen con flash. Peekear en seco es regalar el round.' },
  { autor: 1, titulo: 'Primera vez de 5 y ganamos 13-9', mensaje: 'Jugamos los cinco juntos por primera vez y salió todo. El chat de voz ayuda más de lo que parece.', imagen: 'marcador-13-9.jpg' },
  { autor: 2, titulo: 'Flash pop para entrar a A en Dust2', mensaje: 'Desde largo, contra la pared de la izquierda. Explota apenas pasa la esquina y ciega a todo el sitio.', imagen: 'dust2-flash.jpg' },
  { autor: 3, titulo: '¿Alguien para duo esta noche?', mensaje: 'Tipo 22 h, Premier. Juego de AWP o rifle, lo que haga falta.' },
];

const COMENTARIOS = [
  'Qué locura, la vi en vivo y no lo podía creer.',
  'Esa la tengo que practicar sí o sí.',
  'GG, merecidísimo.',
  'Yo me sumo si todavía buscan gente.',
  '¿Con qué sensibilidad jugás?',
  'Me salvaste el ranked con esto, gracias.',
  'Clásico, siempre peekean igual.',
  'Pasame la config después.',
  'Jajaja el último fue de pura suerte, admitilo.',
  'Mañana la probamos en el server.',
  'Esto debería estar en un tutorial.',
  'Qué nervios ese round.',
];

// ---------------------------------------------------------------------------

async function pedir(metodo, ruta, { token, json, form } = {}) {
  const respuesta = await fetch(API + ruta, {
    method: metodo,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(json ? { 'Content-Type': 'application/json' } : {}),
    },
    body: json ? JSON.stringify(json) : form,
  });
  const texto = await respuesta.text();
  const cuerpo = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    const mensaje = Array.isArray(cuerpo?.message) ? cuerpo.message.join(' ') : cuerpo?.message;
    throw new Error(`${metodo} ${ruta} -> ${respuesta.status} ${mensaje ?? ''}`);
  }
  return cuerpo;
}

async function registrarOEntrar(u) {
  const form = new FormData();
  const datos = { ...u, email: `${u.username.replace(/[._]/g, '')}@clutch.gg`, password: CLAVE };
  for (const [campo, valor] of Object.entries(datos)) form.append(campo, valor);
  try {
    return await pedir('POST', '/auth/registro', { form });
  } catch (error) {
    if (!String(error.message).includes('409')) throw error;
    // Ya existe: se entra con la contraseña de los datos de prueba
    try {
      return await pedir('POST', '/auth/login', { json: { identificador: u.username, password: CLAVE } });
    } catch {
      throw new Error(`El usuario @${u.username} ya existe con otra contraseña. Cambiale el username en USUARIOS.`);
    }
  }
}

console.log(`Cargando datos en ${API}\n`);

const sesiones = [];
for (const u of USUARIOS) {
  const { usuario, token } = await registrarOEntrar(u);
  sesiones.push({ usuario, token });
  console.log(`  usuario  @${usuario.username}`);
}

// Si ya se cargaron antes, no se duplican
const { total } = await pedir('GET', `/publicaciones?usuario=${sesiones[0].usuario._id}&limit=1`, { token: sesiones[0].token });
if (total > 0) {
  console.log('\nLas publicaciones de prueba ya estaban cargadas. No se creó nada nuevo.');
  process.exit(0);
}

const creadas = [];
for (const [i, p] of PUBLICACIONES.entries()) {
  const { token } = sesiones[p.autor];
  const form = new FormData();
  form.append('titulo', p.titulo);
  form.append('mensaje', p.mensaje);
  if (p.imagen && !SIN_IMAGENES) {
    const archivo = await readFile(join(CARPETA_IMAGENES, p.imagen));
    form.append('imagen', new Blob([archivo], { type: 'image/jpeg' }), p.imagen);
  }
  const publicacion = await pedir('POST', '/publicaciones', { token, form });
  creadas.push({ ...publicacion, indice: i, autorIndice: p.autor });
  console.log(`  publicación  ${p.titulo}${p.imagen && !SIN_IMAGENES ? '  (con imagen)' : ''}`);

  // Comentarios y me gusta de otros usuarios
  const otros = sesiones.filter((_, j) => j !== p.autor);
  for (const [k, s] of otros.slice(0, 1 + (i % 4)).entries()) {
    await pedir('POST', `/publicaciones/${publicacion._id}/comentarios`, {
      token: s.token,
      json: { mensaje: COMENTARIOS[(i * 3 + k) % COMENTARIOS.length] },
    });
  }
  for (const s of otros.slice(0, 1 + ((i * 2) % otros.length))) {
    await pedir('POST', `/publicaciones/${publicacion._id}/me-gusta`, { token: s.token });
  }
}

// Fechas repartidas en los últimos 21 días (opcional, necesita MONGO_URI)
if (process.env.MONGO_URI) {
  const { default: mongoose } = await import('mongoose');
  const { default: dns } = await import('node:dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']); // igual que en main.ts, para resolver la URI de Atlas
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const DIA = 24 * 60 * 60 * 1000;
  for (const p of creadas) {
    const _id = new mongoose.Types.ObjectId(p._id);
    const fecha = new Date(Date.now() - ((p.indice * 3) % 21) * DIA - (p.indice % 5) * 3600 * 1000);
    await db.collection('publicaciones').updateOne({ _id }, [
      {
        $set: {
          createdAt: fecha,
          updatedAt: fecha,
          meGusta: { $map: { input: '$meGusta', as: 'm', in: { usuario: '$$m.usuario', fecha: { $add: [fecha, 2 * 3600 * 1000] } } } },
        },
      },
    ]);
    const comentarios = await db.collection('comentarios').find({ publicacion: _id }).sort({ createdAt: 1 }).toArray();
    for (const [k, c] of comentarios.entries()) {
      const fechaComentario = new Date(Math.min(fecha.getTime() + (k + 1) * 0.7 * DIA, Date.now()));
      await db.collection('comentarios').updateOne({ _id: c._id }, { $set: { createdAt: fechaComentario, updatedAt: fechaComentario } });
    }
  }
  await mongoose.disconnect();
  console.log('\n  Fechas repartidas en los últimos 21 días.');
} else {
  console.log('\n  Sin MONGO_URI: todo quedó con la fecha de hoy.');
}

console.log(`\nListo. Contraseña de todos los usuarios: ${CLAVE}`);

import { Routes } from '@angular/router';
import { invitadoGuard } from './guards/invitado.guard';
import { sesionGuard } from './guards/sesion.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Clutch',
    loadComponent: () => import('./paginas/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'login',
    canActivate: [invitadoGuard],
    title: 'Entrar | Clutch',
    loadComponent: () => import('./paginas/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    title: 'Crear cuenta | Clutch',
    loadComponent: () => import('./paginas/registro/registro').then((m) => m.Registro),
  },
  {
    path: '',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./componentes/layout-principal/layout-principal').then((m) => m.LayoutPrincipal),
    children: [
      {
        path: 'publicaciones',
        title: 'Publicaciones | Clutch',
        loadComponent: () =>
          import('./paginas/publicaciones/publicaciones').then((m) => m.Publicaciones),
      },
      {
        path: 'publicaciones/:id',
        title: 'Publicación | Clutch',
        loadComponent: () =>
          import('./paginas/publicacion/publicacion').then((m) => m.Publicacion),
      },
      {
        path: 'mi-perfil',
        title: 'Mi perfil | Clutch',
        loadComponent: () => import('./paginas/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
      },
      {
        path: 'dashboard/usuarios',
        canActivate: [adminGuard],
        title: 'Usuarios | Clutch',
        loadComponent: () => import('./paginas/usuarios/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'dashboard/usuarios/nuevo',
        canActivate: [adminGuard],
        data: { admin: true },
        title: 'Nuevo usuario | Clutch',
        loadComponent: () => import('./paginas/registro/registro').then((m) => m.Registro),
      },
      {
        path: 'dashboard/estadisticas',
        canActivate: [adminGuard],
        title: 'Estadísticas | Clutch',
        loadComponent: () => import('./paginas/estadisticas/estadisticas').then((m) => m.Estadisticas),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada | Clutch',
    loadComponent: () =>
      import('./paginas/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
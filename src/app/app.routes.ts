import { Routes } from '@angular/router';
import { Landing } from './features/landing/landing';
import { Login } from './features/auth/login/login';
import { Layout } from './core/layout/layout';
import { Bloques } from './features/bloques/bloques';
import { Perfil } from './features/perfil/perfil';
import { Actividades } from './features/actividades/actividades';
import { Historial } from './features/historial/historial';
import { authGuard } from './core/guards/auth-guard';
import { Vinculacion } from './features/vinculacion/vinculacion';
import { LayoutWatch } from './core/layout-watch/layout-watch';
import { WatchPin } from './features/watch/watch-pin/watch-pin';
import { WatchDashboard } from './features/watch/watch-dashboard/watch-dashboard';
import { WatchPlayer } from './features/watch/watch-player/watch-player';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'login', component: Login },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'bloques', component: Bloques },
      { path: 'bloques/:bloqueId/actividades', component: Actividades },
      { path: 'historial', component: Historial },
      { path: 'perfil', component: Perfil },
      { path: 'vincular-reloj', component: Vinculacion },
      { path: '', redirectTo: 'bloques', pathMatch: 'full' },
    ],
  },

  {
    path: 'watch',
    component: LayoutWatch,
    children: [
      { path: 'pin', component: WatchPin },
      { path: 'dashboard', component: WatchDashboard },
      { path: 'player/:bloqueId', component: WatchPlayer },
      { path: '', redirectTo: 'pin', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: '' },
];

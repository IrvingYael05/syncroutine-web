import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../services/supabase/supabase';
import { AuthService } from '../services/auth/auth';
import { ToastService } from '../services/toast/toast.service';
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService).supabase;
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  return from(supabase.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;
      let requestToForward = req;

      // Si hay token, se clona la peticion e inyecta
      if (token) {
        requestToForward = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Se envia la petición y se escucha la respuesta
      return next(requestToForward).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el servidor responde con 401 (No Autorizado)
          if (error.status === 401) {
            // 1. Se limpia la sesión en Supabase
            authService.signOut();

            // 2. Detectamos si estamos en la interfaz del reloj o en la web normal
            const currentUrl = router.url;

            if (currentUrl.includes('/watch')) {
              toast.error('Sesión de reloj expirada. Generando nuevo PIN...');
              router.navigate(['/watch/pin']); // <-- Regresa al PIN del reloj
            } else {
              toast.error('Tu sesión ha expirado o es inválida. Inicia sesión nuevamente.');
              router.navigate(['/login']); // <-- Regresa al Login de la Web
            }
          }
          return throwError(() => error);
        }),
      );
    }),
  );
};

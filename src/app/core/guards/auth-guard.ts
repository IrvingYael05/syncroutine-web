import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.isAuthenticated();

  if (!isAuth) {
    // Validación de Autenticación
    router.navigate(['']);
    return false;
  }

  return true;
};

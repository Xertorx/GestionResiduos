import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (typeof window === 'undefined') {
    return true;
  }

  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');

  if (token && role === 'ADMINISTRADOR') {
    return true;
  }

  return router.createUrlTree(['/login']);
};

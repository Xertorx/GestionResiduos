import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const verifyGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const isBrowser = typeof window !== 'undefined';
  const isRegistered = isBrowser && window.localStorage.getItem('registerCompleted') === '1';

  if (isRegistered) {
    window.localStorage.removeItem('registerCompleted');
    return true;
  }

  const tokenFromParams = route.paramMap.get('token');
  const tokenFromQuery = route.queryParamMap.get('token');

  if (tokenFromParams || tokenFromQuery) {
    return true;
  }

  return inject(Router).createUrlTree(['/access-denied']);
};

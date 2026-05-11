import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RegistrationStateService } from '../../../services/registration-state.service';

export const verifyGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const registrationState = inject(RegistrationStateService);
  const isRegistered = registrationState.hasVerifyAccess();

  if (isRegistered) {
    return true;
  }

  const tokenFromParams = route.paramMap.get('token');
  const tokenFromQuery = route.queryParamMap.get('token');

  if (tokenFromParams || tokenFromQuery) {
    return true;
  }

  return inject(Router).createUrlTree(['/access-denied']);
};

// src/app/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = auth.isAuthenticated();
  console.log('[AuthGuard] isAuthenticated:', isAuth);

  if (!isAuth) {
    router.navigateByUrl('/login', { replaceUrl: true });
    return false;
  }

  return true;
};

export const roleGuard = (role: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const isAuth = auth.isAuthenticated();
    const hasRole = auth.hasRole(role);
    console.log(`[RoleGuard] isAuthenticated: ${isAuth}, hasRole(${role}): ${hasRole}`);

    if (!isAuth || !hasRole) {
      router.navigateByUrl('/login', { replaceUrl: true });
      return false;
    }

    return true;
  };
};

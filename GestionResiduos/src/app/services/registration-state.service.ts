import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class RegistrationStateService {
  private readonly isBrowser: boolean;
  private readonly pendingEmailKey = 'userEmail';
  private readonly verifyAccessKey = 'registerCompleted';

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getPendingEmail(): string {
    if (!this.isBrowser) {
      return '';
    }

    return localStorage.getItem(this.pendingEmailKey) || '';
  }

  setPendingEmail(email: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.pendingEmailKey, email || '');
  }

  hasVerifyAccess(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    return localStorage.getItem(this.verifyAccessKey) === '1';
  }

  markVerifyAccess(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.verifyAccessKey, '1');
  }

  consumeVerifyAccess(): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const hasAccess = this.hasVerifyAccess();
    if (hasAccess) {
      localStorage.removeItem(this.verifyAccessKey);
    }

    return hasAccess;
  }
}
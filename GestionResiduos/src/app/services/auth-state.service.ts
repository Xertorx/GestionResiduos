import { Injectable, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthStateService implements OnDestroy {
  private readonly isBrowser: boolean;
  private readonly storageListener = () => this.refreshFromStorage();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private emailSubject = new BehaviorSubject<string>('');
  private nicknameSubject = new BehaviorSubject<string>('');
  private photoSubject = new BehaviorSubject<string>('');
  private initializedSubject = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  email$ = this.emailSubject.asObservable();
  nickname$ = this.nicknameSubject.asObservable();
  photo$ = this.photoSubject.asObservable();
  initialized$ = this.initializedSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (!this.isBrowser) {
      return;
    }

    this.refreshFromStorage();
    window.addEventListener('storage', this.storageListener);
    this.initializedSubject.next(true);
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  refreshFromStorage(): void {
    if (!this.isBrowser) {
      return;
    }

    const token = localStorage.getItem('accessToken');
    const email = localStorage.getItem('userEmail') || '';
    const nickname = localStorage.getItem('nickname') || '';
    const photo = localStorage.getItem('photo') || '';

    this.applyAuthState(token, email, nickname, photo);
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    return localStorage.getItem('accessToken');
  }

  private applyAuthState(token: string | null, email: string, nickname: string, photo: string): void {
    this.isLoggedInSubject.next(!!token);
    this.emailSubject.next(email);
    this.nicknameSubject.next(nickname);
    this.photoSubject.next(photo);
  }

  login(data: { accessToken: string, refreshToken: string, email: string, nickName: string, photo: string, role: string }) {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('nickname', data.nickName);
      localStorage.setItem('photo', data.photo);
      localStorage.setItem('role', data.role);
    }

    this.applyAuthState(data.accessToken, data.email, data.nickName, data.photo);
  }

  updateProfile(nickname: string, photo: string) {
    if (this.isBrowser) {
      localStorage.setItem('nickname', nickname || '');
      localStorage.setItem('photo', photo || '');
    }

    this.applyAuthState(this.getAccessToken(), this.emailSubject.getValue(), nickname || '', photo || '');
  }


  logout() {
    if (this.isBrowser) {
      localStorage.clear();
    }

    this.applyAuthState(null, '', '', '');
    this.router.navigate(['/']);
  }
}
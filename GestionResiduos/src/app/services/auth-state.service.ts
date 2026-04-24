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

    const clean = (v: string | null) => (!v || v === 'null' || v === 'undefined') ? '' : v;

    const token = localStorage.getItem('accessToken');
    const email = clean(localStorage.getItem('userEmail'));
    const nickname = clean(localStorage.getItem('nickname'));
    const photo = clean(localStorage.getItem('photo'));

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

  login(data: any) {
    const token = data.accessToken;
    const refresh = data.refreshToken;
    const email = data.email || '';
    const nickname = data.nickName ?? data.nickname ?? '';
    const photo = data.photo ?? '';
    const role = data.role ?? '';

    if (this.isBrowser) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('nickname', nickname);
      localStorage.setItem('photo', photo);
      localStorage.setItem('role', role);
    }

    this.applyAuthState(token, email, nickname, photo);
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
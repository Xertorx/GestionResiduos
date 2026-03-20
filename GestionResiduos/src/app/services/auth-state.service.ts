import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private nicknameSubject = new BehaviorSubject<string>('');
  private photoSubject = new BehaviorSubject<string>('');

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  nickname$ = this.nicknameSubject.asObservable();
  photo$ = this.photoSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    // Al iniciar lee el localStorage por si ya había sesión
    if (isPlatformBrowser(this.platformId)) {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    const token = localStorage.getItem('accessToken');
    const nickname = localStorage.getItem('nickname') || '';
    const photo = localStorage.getItem('photo') || '';

    this.isLoggedInSubject.next(!!token);
    this.nicknameSubject.next(nickname);
    this.photoSubject.next(photo);
  }

  login(data: { accessToken: string, refreshToken: string, email: string, nickName: string, photo: string, role: string }) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('nickname', data.nickName);
      localStorage.setItem('photo', data.photo);
      localStorage.setItem('role', data.role);
    }
    this.isLoggedInSubject.next(true);
    this.nicknameSubject.next(data.nickName);
    this.photoSubject.next(data.photo);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.isLoggedInSubject.next(false);
    this.nicknameSubject.next('');
    this.photoSubject.next('');
    this.router.navigate(['/']);
  }
}
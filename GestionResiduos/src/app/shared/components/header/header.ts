import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, CommonModule], 
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  isLoggedIn = false;
  nickname = '';
  email = '';
  photo = '';
  authReady = false;
  isBrowser = false;
  isProfileMenuOpen = false;
  isMobileMenuOpen = false;
  private subs = new Subscription();

  constructor(
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    this.subs.add(this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v));
    this.subs.add(this.authState.nickname$.subscribe(v => this.nickname = v));
    this.subs.add(this.authState.email$.subscribe(v => this.email = v));
    this.subs.add(this.authState.photo$.subscribe(v => this.photo = v));
    this.subs.add(this.authState.initialized$.subscribe(v => this.authReady = v));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown-container')) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.authState.logout();
  }
}
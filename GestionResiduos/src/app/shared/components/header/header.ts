import { Component, Inject, OnInit, OnDestroy, PLATFORM_ID, HostListener } from '@angular/core';
import { RecyclingChatComponent } from '../recycling-chat/recycling-chat.component';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, CommonModule, RecyclingChatComponent],
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
  showChatbot = false;
  toggleChatbot() {
    this.showChatbot = !this.showChatbot;
  }

  constructor(
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) return;

    this.subs.add(this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v));
    this.subs.add(this.authState.nickname$.subscribe(v => this.nickname = v));
    this.subs.add(this.authState.email$.subscribe(v => this.email = v));
    this.subs.add(this.authState.photo$.subscribe(v => this.photo = v));
    this.subs.add(this.authState.initialized$.subscribe(v => this.authReady = v));

    // Cerrar el modal del chatbot si navega a /login
    this.subs.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          if (event.urlAfterRedirects === '/login' || event.url === '/login') {
            this.showChatbot = false;
          }
        })
    );
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
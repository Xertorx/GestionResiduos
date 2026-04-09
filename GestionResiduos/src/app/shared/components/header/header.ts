import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, CommonModule], 
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {
  isLoggedIn: boolean = false;
  nickname: string = '';
  photo: string = '';
  authReady: boolean = false;
  isBrowser: boolean = false;

  constructor(
    private authState: AuthStateService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) {
      return;
    }

    this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
    this.authState.nickname$.subscribe(v => this.nickname = v);
    this.authState.photo$.subscribe(v => this.photo = v);
    this.authState.initialized$.subscribe(v => this.authReady = v);
  }

  logout() {
    this.authState.logout();
  }
}
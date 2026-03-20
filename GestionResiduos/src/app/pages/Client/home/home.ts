import { Component, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { IconService } from '../../../services/icon.service';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit, OnInit {

  isLoggedIn: boolean = false;
  nickname: string = '';
  photo: string = '';

  constructor(
    private iconService: IconService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object  // ← inyecta esto
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) { 
      this.isLoggedIn = !!localStorage.getItem('accessToken');
      this.nickname = localStorage.getItem('nickname') || '';
      this.photo = localStorage.getItem('photo') || '';
    }
  }

  ngAfterViewInit() {
    // tu lógica existente
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}

import { Component, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { IconService } from '../../../services/icon.service';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';

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
    private authState: AuthStateService, // ← reemplaza el PLATFORM_ID directo
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // ← suscripción al servicio en lugar de leer localStorage directo
    this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
    this.authState.nickname$.subscribe(v => this.nickname = v);
    this.authState.photo$.subscribe(v => this.photo = v);
  }

  ngAfterViewInit() {
    // tu lógica existente
  }

  logout() {
    this.authState.logout(); // ← usa el servicio
  }
}
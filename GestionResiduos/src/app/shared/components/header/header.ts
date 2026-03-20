import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements  OnInit {
  isLoggedIn: boolean = false;
  nickname: string = '';
  photo: string = '';

  constructor(private authState: AuthStateService) {}

  ngOnInit() {
    this.authState.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
    this.authState.nickname$.subscribe(v => this.nickname = v);
    this.authState.photo$.subscribe(v => this.photo = v);
  }
  logout() {
    this.authState.logout();
  }
}


import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../services/icon.service';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit, OnInit {
  private readonly authSubscriptions = new Subscription();

  isLoggedIn: boolean = false;
  nickname: string = '';
  photo: string = '';
  authReady = false;

  constructor(
    private iconService: IconService,
    private authState: AuthStateService
  ) {}

  ngOnInit() {
    this.authSubscriptions.add(this.authState.isLoggedIn$.subscribe((value) => this.isLoggedIn = value));
    this.authSubscriptions.add(this.authState.nickname$.subscribe((value) => this.nickname = value));
    this.authSubscriptions.add(this.authState.photo$.subscribe((value) => this.photo = value));
    this.authSubscriptions.add(this.authState.initialized$.subscribe((value) => this.authReady = value));
  }

  ngAfterViewInit() {
    // tu lógica existente
  }

  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }

  logout() {
    this.authState.logout();
  }
}
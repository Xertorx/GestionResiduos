import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../../../services/icon.service';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { ApiService } from '../../../services/api.service';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, LucideAngularModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements AfterViewInit, OnInit, OnDestroy {
  private readonly authSubscriptions = new Subscription();

  isLoggedIn = false;
  nickname = '';
  photo = '';
  authReady = false;

  // Stats
  statsLoaded = false;
  ecopointsCount = 0;
  totalReports = 0;
  resolvedReports = 0;
  foroTopics = 0;

  constructor(
    private iconService: IconService,
    private authState: AuthStateService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.authSubscriptions.add(this.authState.isLoggedIn$.subscribe((value) => this.isLoggedIn = value));
    this.authSubscriptions.add(this.authState.nickname$.subscribe((value) => this.nickname = value));
    this.authSubscriptions.add(this.authState.photo$.subscribe((value) => this.photo = value));
    this.authSubscriptions.add(this.authState.initialized$.subscribe((value) => {
      this.authReady = value;
      if (value) this.loadStats();
    }));
  }

  private loadStats(): void {
    forkJoin({
      ecopoints: this.api.getActiveEcopoints(),
      reports: this.api.getReportStatistics(),
      topics: this.api.getActiveTopics()
    }).subscribe({
      next: ({ ecopoints, reports, topics }) => {
        this.ecopointsCount = Array.isArray(ecopoints) ? ecopoints.length : 0;
        this.totalReports = reports?.total ?? 0;
        this.resolvedReports = reports?.resolved ?? 0;
        this.foroTopics = Array.isArray(topics) ? topics.length : 0;
        this.statsLoaded = true;
      },
      error: () => {
        this.statsLoaded = true;
      }
    });
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
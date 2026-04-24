import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../services/api.service';
import { AuthStateService } from '../../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class UserProfile implements OnInit {
  profile: any = null;
  isLoading = true;
  error = '';
  authReady = false;
  private subs = new Subscription();

  constructor(
    private api: ApiService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    this.subs.add(this.authState.initialized$.subscribe(v => {
      this.authReady = v;
      if (v) this.loadProfile();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.api.getUserProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar tu perfil.';
        this.isLoading = false;
      }
    });
  }
}

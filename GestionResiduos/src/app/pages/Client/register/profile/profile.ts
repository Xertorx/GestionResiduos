import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  nickname: string = '';
  preview: string | ArrayBuffer | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authState: AuthStateService,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.preview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const email = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('userEmail')
      : null;

    if (!email) {
      console.error('No se encontró el email en localStorage');
      return;
    }

    const body = {
      email: email,
      nickName: this.nickname,
      photo: this.preview
    };

    this.loadingService.show();

    this.http.put('http://localhost:8080/auth/update-profile', body).subscribe({
      next: (res: any) => {
        this.loadingService.hide();

        // Actualiza nickname y photo en el servicio y localStorage
        this.authState.updateProfile(this.nickname, this.preview as string);

        // Fuerza recarga del estado completo para que isLoggedIn sea true
        if (isPlatformBrowser(this.platformId)) {
          this.authState.loadFromStorage();
        }

        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        this.loadingService.hide();
        console.error('Error al actualizar perfil:', err);
      }
    });
  }
}
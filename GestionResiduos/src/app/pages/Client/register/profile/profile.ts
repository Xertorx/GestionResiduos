import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStateService } from '../../../../services/auth-state.service';
import { LoadingService } from '../../../../services/loading.service';
import { RegistrationStateService } from '../../../../services/registration-state.service';
import { ApiService } from '../../../../services/api.service';

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
  selectedFile: File | null = null;

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private registrationState: RegistrationStateService,
    private loadingService: LoadingService,
    private api: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = e => this.preview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const email = this.registrationState.getPendingEmail();

    if (!email) {
      console.error('No se encontró el email del registro');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('nickName', this.nickname);
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    this.loadingService.show();

    this.api.updateAuthProfile(formData).subscribe({
      next: (res: any) => {
        this.loadingService.hide();
        this.authState.updateProfile(this.nickname, res?.photo || this.preview as string);
        if (isPlatformBrowser(this.platformId)) {
          this.authState.refreshFromStorage();
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
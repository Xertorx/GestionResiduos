import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStateService } from '../../../services/auth-state.service';
import { LoadingService } from '../../../services/loading.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-user-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './user-profile-edit.html',
  styleUrl: './user-profile-edit.scss'
})
export class UserProfileEdit implements OnInit {

  profileForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  canUpdate = true;
  nextUpdateAvailable: string | null = null;
  preview: string | null = null;
  currentPhoto: string | null = null;
  selectedFile: File | null = null;

  showConfirmModal = false;
  showSuccessModal = false;
  showErrorModal = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private authState: AuthStateService,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      names:          ['', [Validators.required, Validators.minLength(2)]],
      lastName:       ['', [Validators.required, Validators.minLength(2)]],
      email:          ['', [Validators.required, Validators.email]],
      nickName:       [''],
      phoneNumber:    ['', [Validators.pattern('^[0-9]{10}$')]],
      neighborhoodId: [''],
      address:        ['']
    });

    this.loadProfile();
  }

  get f() { return this.profileForm.controls; }

  loadProfile(): void {
    this.isLoading = true;
    this.api.getUserProfile().subscribe({
      next: (profile: any) => {
        this.profileForm.patchValue({
          names: profile.names || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          nickName: profile.nickName || '',
          phoneNumber: profile.phoneNumber || '',
          neighborhoodId: profile.neighborhoodId || '',
          address: profile.address || ''
        });
        this.currentPhoto = profile.photo || null;
        this.canUpdate = profile.canUpdate !== false;
        this.nextUpdateAvailable = profile.nextUpdateAvailable || null;

        if (!this.canUpdate) {
          this.profileForm.disable();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
        this.errorMessage = 'No se pudo cargar tu perfil. Intenta de nuevo.';
        this.showErrorModal = true;
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Solo se permiten archivos de imagen.';
      this.showErrorModal = true;
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.preview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.selectedFile = null;
    this.preview = null;
    const input = document.getElementById('profile-photo-input') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  openConfirmModal(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.showConfirmModal = true;
  }

  cancelSave(): void {
    this.showConfirmModal = false;
  }

  confirmSave(): void {
    this.showConfirmModal = false;
    this.isSaving = true;
    this.loadingService.show();

    const formData = new FormData();
    const v = this.profileForm.getRawValue();
    formData.append('names', v.names);
    formData.append('lastName', v.lastName);
    formData.append('email', v.email);
    formData.append('nickName', v.nickName || '');
    formData.append('phoneNumber', v.phoneNumber || '');
    if (v.neighborhoodId) formData.append('neighborhoodId', v.neighborhoodId);
    if (v.address) formData.append('address', v.address);
    if (this.selectedFile) formData.append('photo', this.selectedFile);

    this.api.updateUserProfile(formData).subscribe({
      next: (res: any) => {
        this.loadingService.hide();
        this.isSaving = false;
        this.authState.updateProfile(v.nickName || '', res?.photo || this.preview || this.currentPhoto || '');
        if (isPlatformBrowser(this.platformId)) {
          this.authState.refreshFromStorage();
        }
        this.successMessage = 'Perfil actualizado correctamente.';
        this.showSuccessModal = true;
        this.loadProfile();
      },
      error: (err) => {
        this.loadingService.hide();
        this.isSaving = false;
        if (err.status === 429) {
          this.errorMessage = `Solo puedes actualizar tu perfil una vez al mes. Próxima actualización disponible: ${err.error?.nextUpdateAvailable || 'próximo mes'}.`;
        } else {
          this.errorMessage = err.error?.message || 'Error al actualizar el perfil.';
        }
        this.showErrorModal = true;
      }
    });
  }
}

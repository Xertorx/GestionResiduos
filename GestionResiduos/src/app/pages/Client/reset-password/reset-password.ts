import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword implements OnInit {

  // Estado de la página
  step: 'request' | 'reset' | 'success' = 'request';
  token: string = '';
  errorMessage: string = '';
  showErrorModal: boolean = false;

  // Formulario para solicitar el correo
  requestForm: FormGroup;

  // Formulario para nueva contraseña
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.fb.group({
      newPassword:     ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$')]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  ngOnInit() {
    // Si viene con token en la URL → mostrar formulario de nueva contraseña
    const tokenQuery = this.route.snapshot.queryParamMap.get('token');
    if (tokenQuery) {
      this.token = tokenQuery;
      this.step = 'reset';
    }
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  get r() { return this.requestForm.controls; }
  get f() { return this.resetForm.controls; }

  // Paso 1 — Solicitar correo de recuperación
  onRequestReset() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    this.http.post('http://localhost:8080/auth/forgot-password', {
      email: this.requestForm.value.email
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        this.step = 'success'; // ← muestra mensaje de éxito
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error al solicitar recuperación:', error);
        this.errorMessage = error.status === 500
          ? 'No encontramos una cuenta con ese correo.'
          : 'Ocurrió un error. Intenta de nuevo.';
        this.showErrorModal = true;
      }
    });
  }

  // Paso 2 — Confirmar nueva contraseña
  onResetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    this.http.post('http://localhost:8080/auth/reset-password', {
      token:       this.token,
      newPassword: this.resetForm.value.newPassword
    }).subscribe({
      next: () => {
        this.loadingService.hide();
        setTimeout(() => {
          this.router.navigate(['/login'], { replaceUrl: true });
        }, 2000);
        this.step = 'success';
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error al restablecer contraseña:', error);
        this.errorMessage = error.error?.message || 'Error al restablecer la contraseña.';
        this.showErrorModal = true;
      }
    });
  }
}
// ...existing imports and decorators...
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';
import { LoadingService } from '../../../services/loading.service';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../enviroment/enviroment';

declare const google: any;

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, AfterViewInit, OnDestroy {
  private googleInterval: any;
  showPassword = false;

  form: FormGroup;
  errorMessage: string = '';
  showErrorModal: boolean = false;
  modalTitle: string = '';
  showModal: boolean = false;

  constructor(
    private router: Router,
    private authState: AuthStateService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    private api: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  ngOnInit() {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initGoogleSDK();
    }
  }

  ngOnDestroy() {
    if (this.googleInterval) {
      clearInterval(this.googleInterval);
    }
  }

  initGoogleSDK() {
    this.googleInterval = setInterval(() => {
      if (typeof (window as any).google !== 'undefined') {
        clearInterval(this.googleInterval);

        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          use_fedcm_for_prompt: false,
          use_fedcm_for_button: false,
          callback: (response: any) => {
            this.ngZone.run(() => {
              this.handleGoogleLogin(response);
            });
          }
        });

        google.accounts.id.renderButton(
          document.getElementById('google-login-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'signin_with',
            locale: 'es'
          }
        );
      }
    }, 100);
  }

  handleGoogleLogin(response: any) { // ← corregido, faltaba "ha" al inicio
    const payload = this.decodeJwt(response.credential);

    this.loadingService.show();

    this.api.loginGoogle(payload.email, payload.sub).subscribe({
      next: (res: any) => {
        this.loadingService.hide();
        this.authState.login(res);
        this.modalTitle = '¡Bienvenido de nuevo!';
        this.showModal = true;
        setTimeout(() => {
          this.showModal = false;
          const role = res.role;
          if (role === 'ADMIN') {
            this.router.navigate(['/dashboard'], { replaceUrl: true });
          } else {
            this.router.navigate(['/'], { replaceUrl: true });
          }
        }, 1500);
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error login Google:', error);

        if (error.status === 404 || error.status === 500) {
          this.router.navigate(['/register']);
          return;
        }

        this.errorMessage = 'Error al iniciar sesión con Google. Intenta de nuevo.';
        this.showErrorModal = true;
      }
    });
  }

  decodeJwt(token: string): any {
    const base64 = token.split('.')[1];
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  onLogin() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    this.api.login(this.form.value.email, this.form.value.password).subscribe({
      next: (response: any) => {
        this.loadingService.hide();
        this.authState.login(response);
        this.modalTitle = '¡Bienvenido de nuevo!';
        this.showModal = true;
        setTimeout(() => {
          this.showModal = false;
          const role = response.role;
          if (role === 'ADMINISTRADOR') {
            this.router.navigate(['/dashboard'], { replaceUrl: true });
          } else if(role === 'CIUDADANO') {
            this.router.navigate(['/'], { replaceUrl: true });
          }
        }, 1500);
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error en el login', error);
        if (error.status === 401) {
          this.errorMessage = 'Correo o contraseña incorrectos.';
        } else {
          this.errorMessage = 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
        }
        this.showErrorModal = true;
      }
    });
  }
}
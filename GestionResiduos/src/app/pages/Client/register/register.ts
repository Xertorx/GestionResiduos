import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthStateService } from '../../../services/auth-state.service';
import { LoadingService } from '../../../services/loading.service';
import { RegistrationStateService } from '../../../services/registration-state.service';
import { ApiService } from '../../../services/api.service';
import { environment } from '../../../../enviroment/enviroment';

declare const google: any;

export interface GoogleRegisterRequest {
  names: string;
  lastName: string;
  email: string;
  photo: string;
  googleId: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  neighborhoodId: number;
  address: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [LucideAngularModule, ReactiveFormsModule, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit, AfterViewInit, OnDestroy {
  private googleInterval: any;

  form: FormGroup;
  googleForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  showErrorModal: boolean = false;
  googleUser: any = null;
  showCompleteForm: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authState: AuthStateService,
    private loadingService: LoadingService,
    private registrationState: RegistrationStateService,
    private api: ApiService,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.form = this.fb.group({
      names:          ['', [Validators.required, Validators.minLength(4)]],
      lastName:       ['', [Validators.required, Validators.minLength(4)]],
      documentType:   ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      email:          ['', [Validators.required, Validators.email]],
      birthDate:      ['', Validators.required],
      neighborhoodId: ['', Validators.required],
      address:        ['', Validators.required],
      phoneNumber:    ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password:       ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).+$')]],
      confirmPassword:['', Validators.required],
      terminos:       [false, Validators.requiredTrue]
    }, { validators: this.passwordsMatch });

    this.googleForm = this.fb.group({
      documentType:   ['', Validators.required],
      documentNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      birthDate:      ['', Validators.required],
      neighborhoodId: ['', Validators.required],
      address:        ['', Validators.required],
      phoneNumber:    ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

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
            this.ngZone.run(async () => {
              await this.handleGoogleCallback(response);
            });
          }
        });

        google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: 'continue_with',
            locale: 'es'
          }
        );
      }
    }, 100);
  }

  async handleGoogleCallback(response: any) {
    const payload = this.decodeJwt(response.credential);

    // Descarga la foto y conviértela a Base64
    let photoBase64 = '';
    try {
      const photoResponse = await fetch(payload.picture);
      const blob = await photoResponse.blob();
      photoBase64 = await this.blobToBase64(blob);
    } catch (e) {
      console.warn('No se pudo cargar la foto de Google:', e);
      photoBase64 = '';
    }

    this.googleUser = {
      firstName: payload.given_name,
      lastName:  payload.family_name,
      email:     payload.email,
      photoUrl:  photoBase64 || payload.picture,
      id:        payload.sub
    };

    this.showCompleteForm = true;
  }

  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  decodeJwt(token: string): any {
    const base64 = token.split('.')[1];
    const decoded = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  completeGoogleRegister() {
    if (this.googleForm.invalid) {
      this.googleForm.markAllAsTouched();
      return;
    }

    const payload: GoogleRegisterRequest = {
      names:    this.googleUser?.firstName || '',
      lastName: this.googleUser?.lastName  || '',
      email:    this.googleUser?.email     || '',
      photo:    this.googleUser?.photoUrl  || '',
      googleId: this.googleUser?.id        || '',
      ...this.googleForm.value
    };

    this.loadingService.show();

    this.api.registerGoogle(payload).subscribe({
      next: (response: any) => {
        this.loadingService.hide();
        this.authState.login(response);
        this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error registro Google:', error);
        this.errorMessage = 'Error al registrar con Google. Intenta de nuevo.';
        this.showErrorModal = true;
      }
    });
  }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordsMismatch: true };
  }

  get f() { return this.form.controls; }

  onRegister() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, terminos, ...payload } = this.form.value;

    this.loadingService.show();

    this.api.registerUser(payload).subscribe({
      next: (response: any) => {
        this.loadingService.hide();
        const emailRegister = response?.email ?? this.form.value.email;

        this.registrationState.setPendingEmail(emailRegister || '');

        if (response?.message === 'PENDIENTE') {
          this.router.navigate(['/register/verify'], { replaceUrl: true });
          return;
        }

        this.registrationState.markVerifyAccess();
        this.router.navigate(['/register/verify'], { replaceUrl: true });
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Error en el registro', error);

        if (error.status === 409) {
          const mensaje = error.error?.message;

          if (mensaje === 'PENDIENTE') {
            this.registrationState.setPendingEmail(this.form.value.email);
            this.registrationState.markVerifyAccess();
            this.router.navigate(['/register/verify'], { replaceUrl: true });
            return;
          }

          this.errorMessage = 'Este documento ya está registrado.';
          this.showErrorModal = true;
          return;
        }

        this.errorMessage = 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
        this.showErrorModal = true;
      }
    });
  }
}
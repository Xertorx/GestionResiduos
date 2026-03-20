import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthStateService } from '../../../../services/auth-state.service';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  nickName: string;
  photo: string;
  role: string;
}

@Component({
  selector: 'app-verify',
  imports: [CommonModule],
  templateUrl: './verify.html',
  styleUrl: './verify.scss'
})
export class Verify implements OnInit, OnDestroy {
  countdown: string = '15:00';
  message: string = 'Esperando token de verificación...';
  error: string = '';
  private interval: any;
  private totalSeconds: number = 15 * 60;
  public emailRegister: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authState: AuthStateService, // ← agrega esto
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.startCountdown();

    if (isPlatformBrowser(this.platformId)) {
      this.emailRegister = localStorage.getItem('userEmail') || '';
    }

    const tokenQuery = this.route.snapshot.queryParamMap.get('token');

    if (tokenQuery) {
      this.message = 'Verificando token...';
      this.verifyToken(tokenQuery);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('registerCompleted') === '1') {
        this.message = 'Registro completado. Revisa tu correo para verificar tu cuenta.';
      } else {
        this.message = 'No se encontró token de verificación.';
      }
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  startCountdown() {
    this.updateCountdown();
    this.interval = setInterval(() => {
      if (this.totalSeconds > 0) {
        this.totalSeconds--;
        this.updateCountdown();
      } else {
        clearInterval(this.interval);
      }
    }, 1000);
  }

  updateCountdown() {
    const minutes = Math.floor(this.totalSeconds / 60);
    const seconds = this.totalSeconds % 60;
    this.countdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  requestNewToken() {
    if (!this.emailRegister) {
      this.error = 'No se encontró el email. Intenta registrarte de nuevo.';
      return;
    }

    const verifyUrl = `http://localhost:8080/auth/resend-verification?email=${encodeURIComponent(this.emailRegister)}`;
    this.http.post(verifyUrl, {}).subscribe({
      next: () => {
        this.message = 'Nuevo correo de verificación enviado. Revisa tu bandeja de entrada.';
        this.totalSeconds = 15 * 60;
        this.updateCountdown();
      },
      error: (err) => {
        console.error('Error al solicitar nuevo token', err);
        this.error = 'Error al solicitar nuevo token. Intenta otra vez.';
      }
    });
  }

  verifyToken(token: string) {
    const verifyUrl = `http://localhost:8080/auth/verify?token=${encodeURIComponent(token)}`;

    this.http.get<AuthResponse>(verifyUrl).subscribe({
      next: (res) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('userEmail', res.email || this.emailRegister);
        }
        this.message = '¡Token válido! Redirigiendo al perfil...';
        setTimeout(() => this.router.navigate(['/register/profile'], { replaceUrl: true }), 800);
      },
      error: (err) => {
        console.error('Error de verificación', err);
        if (err?.status === 405) {
          this.error = 'Método inválido.';
        } else if (err?.status === 0) {
          this.error = 'No se pudo conectar al servidor.';
        } else {
          this.error = err?.error?.message || 'Error al verificar token. Intenta otra vez.';
        }
        this.message = '';
      }
    });
  }
}
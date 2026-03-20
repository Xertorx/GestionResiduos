import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconService } from '../../../services/icon.service';
import { LucideAngularModule } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../services/auth-state.service';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, LucideAngularModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  form: FormGroup;
  errorMessage: string = '';
  showErrorModal: boolean = false;
  modalTitle: string = '';
  showModal: boolean = false;
  

  constructor(
    private iconService: IconService,
    private router: Router,
    private http: HttpClient,
    private authState: AuthStateService,
    private fb: FormBuilder,
    private loadingService: LoadingService
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get f() { return this.form.controls; }

  onLogin() {
    this.errorMessage = '';
    this.loadingService.show();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.post('http://localhost:8080/auth/login', this.form.value).subscribe({
      next: (response: any) => {
        this.authState.login(response);
       this.loadingService.hide(); 
        this.modalTitle = '¡Bienvenido de nuevo!';
        this.showModal = true;
        setTimeout(() => {
          this.router.navigate(['/'], { replaceUrl: true });
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
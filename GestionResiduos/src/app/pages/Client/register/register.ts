import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [LucideAngularModule, ReactiveFormsModule, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  form: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  errorMessage: string = '';
  showErrorModal: boolean = false;

  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      names:          ['', [Validators.required, Validators.minLength(8)]],
      lastName:       ['', [Validators.required, Validators.minLength(8)]],
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

    this.http.post('http://localhost:8080/auth/register/user', payload).subscribe({
      next: (response: any) => {
        const emailRegister = response?.email ?? this.form.value.email;
        localStorage.setItem('userEmail', emailRegister || '');

        if (response?.message === 'PENDIENTE') {
          this.router.navigate(['/register/verify'], { replaceUrl: true });
          return;
        }

        localStorage.setItem('registerCompleted', '1');
        this.router.navigate(['/register/verify'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('Error en el registro', error);

        if (error.status === 409) {
          const mensaje = error.error?.message;
       
          if (mensaje === 'PENDIENTE') {
            localStorage.setItem('userEmail', this.form.value.email);
            localStorage.setItem('registerCompleted', '1');
            this.router.navigate(['/register/verify'], { replaceUrl: true });
            return;
          }
          this.errorMessage = 'Este documento ya está registrado.';
          this.showErrorModal = true; // ← abre el modal
          return;
        }

        this.errorMessage = 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
        this.showErrorModal = true; // ← abre el modal
      }
    });
  }
}
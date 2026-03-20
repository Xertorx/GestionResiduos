import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [LucideAngularModule, FormsModule, RouterOutlet],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  constructor(private router: Router, private http: HttpClient) { }

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  /*
    Json:
    User {
        documentNumber: int
        names: string
        lastName: string
        documentType: string
        email: string
        birthDate: Date
        neighborhoodId: int
        address: string
        password: string
        status: string
        phoneNumber: string
        roleId: int
    }
 */
  // Form data
  documentNumber: string = '';
  names: string = '';
  lastName: string = '';
  documentType: string = '';
  email: string = '';
  birthDate: string = '';
  neighborhoodId: Number = 0;
  address: string = '';
  phoneNumber: string = '';
  password: string = '';
  errorMessage: string = '';


  onRegister() {
    const payload = {
      documentNumber: this.documentNumber,
      names: this.names,
      lastName: this.lastName,
      documentType: this.documentType,
      birthDate: this.birthDate,
      neighborhoodId: this.neighborhoodId,
      address: this.address,
      email: this.email,
      password: this.password,
      phoneNumber: this.phoneNumber
    };

    this.http.post('http://localhost:8080/auth/register/user', payload).subscribe({
      next: (response: any) => {
        console.log('Registro exitoso', response);
        const emailRegister = response?.email ?? response?.data?.email ?? this.email;
        if (!emailRegister) {
          console.warn('Email no presente en response, uso email local', this.email);
        }
        localStorage.setItem('userEmail', emailRegister || '');
        localStorage.setItem('registerCompleted', '1');
        // Navegación en la misma pestaña (no abrir nueva pestaña)
        this.router.navigate(['/register/verify'], { replaceUrl: true });
      },
    
      // En el subscribe:
      error: (error) => {
        console.error('Error en el registro', error);

        if (error.status === 409) {
          const mensaje = error.error?.message;

          if (mensaje === 'PENDIENTE') {
            localStorage.setItem('userEmail', this.email);
            localStorage.setItem('registerCompleted', '1');
            this.router.navigate(['/register/verify'], { replaceUrl: true });
            return;
          }

          // ID o email ya registrado y activo
          this.errorMessage = 'Este documento ya está registrado.';
          return;
        }

        // Error genérico
        this.errorMessage = 'Ocurrió un error al crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}

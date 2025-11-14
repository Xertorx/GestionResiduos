import { Component } from '@angular/core';
import { Router } from '@angular/router'
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-register',
  imports: [LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  constructor(private router: Router) {}

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  onRegister() {
    // Aquí puedes hacer tu lógica de registro, por ejemplo llamar a un servicio
    // Luego rediriges:
    this.router.navigate(['/register/verify']);
  }
}

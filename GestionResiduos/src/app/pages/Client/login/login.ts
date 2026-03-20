import { AfterViewInit, Component, PLATFORM_ID, Inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IconService } from '../../../services/icon.service';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthStateService } from '../../../services/auth-state.service';



@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login  {
  email: string = '';
  password: string = '';
  
  constructor(
    private iconService: IconService,
    private router: Router,
    private http: HttpClient,
    private authState: AuthStateService  // ← inyecta el servicio
  ) { }

  onLogin() {
    const payload = { email: this.email, password: this.password };

    this.http.post('http://localhost:8080/auth/login', payload).subscribe({
      next: (response: any) => {
        console.log('Login exitoso:', response);
        this.authState.login(response);  // ← una sola línea
        this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('Error en el login', error);
      }
    });
  }


}

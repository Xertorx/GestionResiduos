import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  nickname: string = '';
  preview: string | ArrayBuffer | null = null;

  constructor(
    private http: HttpClient,
    private router: Router  
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.preview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    const email = localStorage.getItem('userEmail');

    if (!email) {
      console.error('No se encontró el email en localStorage');
      return;
    }

    const body = {
      email: email,
      nickName: this.nickname,
      photo: this.preview  // Ya es Base64 gracias al FileReader
    };

    this.http.put('http://localhost:8080/auth/update-profile', body).subscribe({
      next: (res) => {
          //console.log('Perfil actualizado:', res);
          localStorage.setItem('userEmail', email || '');
          localStorage.setItem('nickname', this.nickname);
          localStorage.setItem('photo', this.preview as string);
          this.router.navigate(['/'], { replaceUrl: true });
      },
      error: (err) => console.error('Error al actualizar perfil:', err)
    });
  }
}
import { Component, NgModule} from '@angular/core';
import { FormsModule } from '@angular/forms';
  

@Component({
  selector: 'app-profile',
   standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  nombre: string = '';
  preview: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.preview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    console.log('Nombre:', this.nombre);
    console.log('Archivo:', this.preview);
    // Aquí envías los datos al backend
  }
}

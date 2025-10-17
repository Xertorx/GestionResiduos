import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports {

  previewUrl: string | null = null;
  selectedFile: File | null = null;
  savedImages: string[] = [];
  selectionMessage: string = 'No hay imagen seleccionada';

  constructor() {
    try {
      const data = localStorage.getItem('reports_images');
      this.savedImages = data ? JSON.parse(data) : [];
    } catch (e) {
      this.savedImages = [];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Reset selection message once a file is chosen
    this.selectionMessage = '';
  }

  saveImage() {
    if (!this.previewUrl) return;
    // prepend so latest first
    this.savedImages = [this.previewUrl, ...this.savedImages];
    try {
      localStorage.setItem('reports_images', JSON.stringify(this.savedImages));
    } catch (e) {
      console.error('No se pudo guardar la imagen en localStorage', e);
    }
    this.previewUrl = null;
    this.selectedFile = null;
    const input = document.getElementById('report-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  cancelSelection() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.selectionMessage = 'Por favor, selecciona una imagen nuevamente';
    const input = document.getElementById('report-file') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  removeImage(index: number) {
    if (index < 0 || index >= this.savedImages.length) return;
    this.savedImages.splice(index, 1);
    try {
      localStorage.setItem('reports_images', JSON.stringify(this.savedImages));
    } catch (e) {
      console.error('No se pudo actualizar localStorage', e);
    }
  }

  removeImageBySrc(src: string) {
    const index = this.savedImages.indexOf(src);
    if (index === -1) return;
    this.removeImage(index);
  }

  // placeholder para futura subida al backend
  async uploadToBackend() {
    // Implementar cuando exista endpoint
    console.log('Subir al backend:', this.savedImages.length, 'imágenes');
  }

}

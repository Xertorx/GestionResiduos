import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { EducationService, EducationContent } from '../../../services/education.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-educacion',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './educacion.html',
  styleUrls: ['./educacion.scss']
})
export class EducacionAdmin implements OnInit {

  // ── Lista de contenidos del backend ──
  contenidos: EducationContent[] = [];
  isLoading = true;

  // ── Estado del formulario de creación ──
  showForm = false;
  isSubmitting = false;
  newTitle = '';
  newDescription = '';
  newCategory = 'reciclaje';
  selectedFile: File | null = null;
  selectedFileName = '';

  // ── Categorías disponibles ──
  categories = [
    { value: 'reciclaje', label: 'Reciclaje' },
    { value: 'compostaje', label: 'Compostaje' },
    { value: 'residuos_peligrosos', label: 'Residuos Peligrosos' },
    { value: 'economia_circular', label: 'Economía Circular' },
    { value: 'huella_ecologica', label: 'Huella Ecológica' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(private educationService: EducationService) {}

  ngOnInit(): void {
    this.loadContents();
  }

  loadContents(): void {
    this.isLoading = true;
    this.educationService.getAll().subscribe({
      next: (data) => {
        this.contenidos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando contenidos:', err);
        this.isLoading = false;
        Swal.fire('Error', 'No se pudieron cargar los contenidos del servidor.', 'error');
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  submitContent(): void {
    // ── Validaciones ──
    if (!this.newTitle.trim()) {
      Swal.fire('Atención', 'El título es obligatorio.', 'warning');
      return;
    }
    if (!this.selectedFile) {
      Swal.fire('Atención', 'Debes seleccionar un archivo (PDF, JPG, PNG o WEBP).', 'warning');
      return;
    }

    // Validar extensión
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mkv'];
    const fileName = this.selectedFile.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      Swal.fire('Error', 'Tipo de archivo no permitido. Usa: PDF, JPG, PNG, WEBP o videos.', 'error');
      return;
    }

    this.isSubmitting = true;

    this.educationService.create(
      this.newTitle.trim(),
      this.newDescription.trim(),
      this.newCategory,
      this.selectedFile
    ).subscribe({
      next: (saved) => {
        this.isSubmitting = false;
        Swal.fire('¡Listo!', `El contenido "${saved.title}" se subió correctamente.`, 'success');
        this.contenidos.unshift(saved); // Lo agrega al inicio de la lista
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error subiendo contenido:', err);
        Swal.fire('Error', 'No se pudo subir el contenido. Revisa la consola para más detalles.', 'error');
      }
    });
  }

  deleteContent(content: EducationContent): void {
    Swal.fire({
      title: '¿Eliminar este contenido?',
      text: `Se eliminará "${content.title}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.educationService.delete(content.id).subscribe({
          next: () => {
            this.contenidos = this.contenidos.filter(c => c.id !== content.id);
            Swal.fire('Eliminado', 'El contenido se eliminó correctamente.', 'success');
          },
          error: (err) => {
            console.error('Error eliminando:', err);
            Swal.fire('Error', 'No se pudo eliminar el contenido.', 'error');
          }
        });
      }
    });
  }

  private resetForm(): void {
    this.newTitle = '';
    this.newDescription = '';
    this.newCategory = 'reciclaje';
    this.selectedFile = null;
    this.selectedFileName = '';
  }

  getFileTypeIcon(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file';
    }
  }
}
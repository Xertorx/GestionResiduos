import { Component, OnInit } from '@angular/core';
import { AuthStateService } from '../../../services/auth-state.service';
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
  isAuthenticated = false;

  // ── Lista de contenidos del backend ──
  contenidos: EducationContent[] = [];
  isLoading = true;

  // ── Estado del formulario ──
  showForm = false;
  isSubmitting = false;
  isEditMode = false;
  editingId: number | null = null;

  newTitle = '';
  newDescription = '';
  newCategory = 'reciclaje';

  // Múltiples archivos (solo aplica en modo crear)
  selectedFiles: File[] = [];

  categories = [
    { value: 'reciclaje', label: 'Reciclaje' },
    { value: 'compostaje', label: 'Compostaje' },
    { value: 'residuos_peligrosos', label: 'Residuos Peligrosos' },
    { value: 'economia_circular', label: 'Economía Circular' },
    { value: 'huella_ecologica', label: 'Huella Ecológica' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(private educationService: EducationService, private authState: AuthStateService) {}

  ngOnInit(): void {
    this.loadContents();
    this.authState.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isAuthenticated = isLoggedIn;
    });
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

  // ── Mostrar/ocultar formulario ──
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    } else {
      this.isEditMode = false;
      this.editingId = null;
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.showForm = false;
  }

  // ── Selección MÚLTIPLE (acumulativa) ──
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const incoming = Array.from(input.files);
      this.selectedFiles = [...this.selectedFiles, ...incoming];
      // Limpia el input para poder re-seleccionar el mismo archivo si hace falta
      input.value = '';
    }
  }

  removeSelectedFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  // ── Abrir en modo EDITAR (prellenado) ──
  openEditForm(content: EducationContent): void {
    this.isEditMode = true;
    this.editingId = content.id;
    this.newTitle = content.title;
    this.newDescription = content.description || '';
    this.newCategory = content.category || 'reciclaje';
    this.selectedFiles = [];
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Submit: decide crear o editar ──
  submitContent(): void {
    if (this.isEditMode) {
      this.submitEdit();
    } else {
      this.submitCreate();
    }
  }

  private submitCreate(): void {
    if (!this.newTitle.trim()) {
      Swal.fire('Atención', 'El título es obligatorio.', 'warning');
      return;
    }
    if (this.selectedFiles.length === 0) {
      Swal.fire('Atención', 'Debes seleccionar al menos un archivo.', 'warning');
      return;
    }

    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.avi', '.mkv'];
    const invalidFile = this.selectedFiles.find(f => {
      const name = f.name.toLowerCase();
      return !allowedExtensions.some(ext => name.endsWith(ext));
    });
    if (invalidFile) {
      Swal.fire('Error', `El archivo "${invalidFile.name}" tiene una extensión no permitida.`, 'error');
      return;
    }

    this.isSubmitting = true;
    this.educationService.create(
      this.newTitle.trim(),
      this.newDescription.trim(),
      this.newCategory,
      this.selectedFiles
    ).subscribe({
      next: (saved) => {
        this.isSubmitting = false;
        Swal.fire(
          '¡Listo!',
          `El contenido "${saved.title}" se subió con ${saved.files?.length ?? 0} archivo(s).`,
          'success'
        );
        this.contenidos.unshift(saved);
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error subiendo contenido:', err);
        Swal.fire('Error', 'No se pudo subir el contenido.', 'error');
      }
    });
  }

  private submitEdit(): void {
    if (!this.editingId) return;
    if (!this.newTitle.trim()) {
      Swal.fire('Atención', 'El título es obligatorio.', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.educationService.update(this.editingId, {
      title: this.newTitle.trim(),
      description: this.newDescription.trim(),
      category: this.newCategory
    }).subscribe({
      next: (updated) => {
        this.isSubmitting = false;
        Swal.fire('¡Actualizado!', `Se guardaron los cambios de "${updated.title}".`, 'success');
        const idx = this.contenidos.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.contenidos[idx] = updated;
        this.resetForm();
        this.showForm = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error actualizando:', err);
        Swal.fire('Error', 'No se pudieron guardar los cambios.', 'error');
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
    this.selectedFiles = [];
    this.isEditMode = false;
    this.editingId = null;
    this.isSubmitting = false;
  }

  // ── Helpers para la vista ──
  getPrimaryFileType(content: EducationContent): string {
    return content.files?.[0]?.fileType ?? 'OTRO';
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
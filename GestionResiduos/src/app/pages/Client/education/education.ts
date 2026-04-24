import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { EducationService, EducationContent } from '../../../services/education.service';
import { AuthStateService } from '../../../services/auth-state.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './education.html',
  styleUrls: ['./education.scss'],
})
export class Education implements OnInit {

  // ── Datos que vienen del backend ──
  backendContents: EducationContent[] = [];
  isLoading = true;
  errorMsg = '';

  // ── Datos combinados para la vista (backend + fallback local) ──
  guides: any[] = [];

  isLoggedIn = false;

  constructor(
    private educationService: EducationService,
    private authState: AuthStateService
  ) {}



  loadContents(): void {
    this.isLoading = true;
    this.educationService.getAll().subscribe({
      next: (data) => {
        this.backendContents = data;
        this.buildGuides();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando contenidos educativos:', err);
        this.errorMsg = 'No se pudieron cargar los contenidos. Mostrando datos de ejemplo.';
        this.buildGuides();
        this.isLoading = false;
      }
    });
  }

  /**
   * Combina los contenidos del backend con las tarjetas locales de ejemplo.
   * Usa el primer archivo de tipo IMAGE como portada de la tarjeta;
   * si no hay imagen, cae a un placeholder de picsum.
   */
  private buildGuides(): void {
    this.guides = this.backendContents.map((c) => {
      const primaryType = c.files?.[0]?.fileType ?? 'OTRO';
      const firstImage = c.files?.find(f => f.fileType === 'IMAGE');
      const cover = firstImage
        ? firstImage.fileUrl
        : `https://picsum.photos/seed/edu${c.id}/640/360`;

      return {
        id: c.id,
        icon: this.getIconByFileType(primaryType),
        type: primaryType,
        title: c.title,
        description: c.description || 'Contenido educativo sobre gestión de residuos.',
        image: cover,
        time: '',
        button: this.getButtonByFileType(primaryType),
      };
    });
  }

  private getIconByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file-text'; // Lucide sí provee 'file-text', no 'file'
    }
  }

  private getButtonByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'Ver guía';
      case 'IMAGE': return 'Ver infografía';
      case 'VIDEO': return 'Ver video';
      default: return 'Ver contenido';
    }
  }

  // --- Feedback: ¿Fue útil este contenido? ---
  // Estado de feedback por contenido
  public feedbackState: { [contentId: number]: boolean } = {};

  ngOnInit(): void {
    this.loadContents();
    this.authState.isLoggedIn$.subscribe((logged) => {
      this.isLoggedIn = logged;
    });
  }

  public hasVoted(contentId: number): boolean {
    return !!this.feedbackState[contentId];
  }

  public sendFeedback(contentId: number, useful: boolean): void {
    if (this.hasVoted(contentId)) return;
    this.educationService.sendFeedback(contentId, useful).subscribe({
      next: (res) => {
        // Detectar mensaje de feedback ya registrado
        if (
          (res && (res.alreadyVoted || res.useful !== undefined || res.notUseful !== undefined)) ||
          (res && typeof res.message === 'string' && res.message.includes('Ya se registró el feedback'))
        ) {
          this.feedbackState[contentId] = true;
        }
        if (res && typeof res.message === 'string' && res.message.includes('Ya se registró el feedback')) {
          Swal.fire('Info', 'Ya enviaste feedback para este contenido.', 'info');
        } else {
          Swal.fire({
            icon: 'success',
            title: '¡Gracias por tu feedback!',
            text: useful ? 'Tu opinión nos ayuda a mejorar el contenido.' : 'Gracias por ayudarnos a mejorar.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        if (
          err?.error?.alreadyVoted ||
          (err?.error?.message && typeof err.error.message === 'string' && err.error.message.includes('Ya se registró el feedback'))
        ) {
          this.feedbackState[contentId] = true;
          Swal.fire('Info', 'Ya enviaste feedback para este contenido.', 'info');
        } else {
          Swal.fire('Error', 'No se pudo enviar tu feedback.', 'error');
        }
      }
    });
  }
}
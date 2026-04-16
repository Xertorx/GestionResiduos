import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { EducationService, EducationContent } from '../../../services/education.service';

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

  constructor(private educationService: EducationService) {}

  ngOnInit(): void {
    this.loadContents();
  }

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
   * Si el backend devuelve datos, se muestran PRIMERO.
   */
  private buildGuides(): void {
    const fromBackend = this.backendContents.map((c) => ({
      id: c.id,
      icon: this.getIconByFileType(c.fileType),
      type: c.fileType,
      title: c.title,
      description: c.description || 'Contenido educativo sobre gestión de residuos.',
      image: c.fileType === 'IMAGE' ? c.fileUrl : `https://picsum.photos/seed/edu${c.id}/640/360`,
      time: '',
      button: this.getButtonByFileType(c.fileType),
      fromBackend: true
    }));

    // ── Tarjetas locales con IDs originales 1-6 (para que el detalle funcione) ──
    const localGuides = [
      {
        id: 1, icon: 'book-open', type: 'Guía PDF',
        title: 'Guía de Separación de Residuos',
        description: 'Aprende a separar correctamente los residuos orgánicos, reciclables y especiales.',
        image: 'https://picsum.photos/seed/edu1/640/360', time: '15 min',
        button: 'Ver guía', fromBackend: false
      },
      {
        id: 2, icon: 'video', type: 'Video',
        title: 'Introducción al Compostaje',
        description: 'Aprende a transformar tus residuos orgánicos en abono natural para plantas.',
        image: 'https://picsum.photos/seed/edu2/640/360', time: '8 min',
        button: 'Ver video', fromBackend: false
      },
      {
        id: 3, icon: 'image', type: 'Infografía',
        title: 'Tipos de Plástico y su Reciclaje',
        description: 'Identifica los diferentes tipos de plástico y cómo reciclarlos correctamente.',
        image: 'https://picsum.photos/seed/edu3/640/360', time: '5 min',
        button: 'Ver infografía', fromBackend: false
      },
      {
        id: 4, icon: 'book-open', type: 'Guía PDF',
        title: 'Manejo de Residuos Peligrosos',
        description: 'Guía completa para el manejo seguro de residuos peligrosos en el hogar.',
        image: 'https://picsum.photos/seed/edu4/640/360', time: '20 min',
        button: 'Ver guía', fromBackend: false
      },
      {
        id: 5, icon: 'video', type: 'Video',
        title: 'Reduciendo tu Huella Ecológica',
        description: 'Consejos prácticos para reducir tu impacto ambiental en el día a día.',
        image: 'https://picsum.photos/seed/edu5/640/360', time: '12 min',
        button: 'Ver video', fromBackend: false
      },
      {
        id: 6, icon: 'image', type: 'Infografía',
        title: 'Economía Circular en Casa',
        description: 'Cómo aplicar principios de economía circular en tu hogar y comunidad.',
        image: 'https://picsum.photos/seed/edu6/640/360', time: '7 min',
        button: 'Ver infografía', fromBackend: false
      }
    ];

    if (fromBackend.length > 0) {
      this.guides = [...fromBackend, ...localGuides];
    } else {
      this.guides = localGuides;
    }
  }

  private getIconByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file';
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

  openModal() {
    Swal.fire({
      title: 'Gracias por darnos tu opinión',
      icon: 'success',
      draggable: true
    });
  }
}
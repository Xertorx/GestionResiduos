import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CarouselComponent } from '../../../../shared/components/carousel/carousel';
import { EducationService, EducationContent } from '../../../../services/education.service';

export interface Resource {
  id: number;
  title: string;
  description: string;
  type?: string;
  time?: string;
  author?: string;
  date?: string;
  images?: string[];
  pdfs?: { name: string; url: string }[];
  sections?: {
    title: string;
    content: string;
    icon?: string;
    summary?: string;
    images?: string[];
    pdfs?: { name: string; url: string }[];
    topics?: { title: string; content?: string }[];
  }[];
}

@Component({
  selector: 'app-education-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, CarouselComponent],
  templateUrl: './education-detail.html',
  styleUrls: ['./education-detail.scss']
})
export class EducationDetail implements OnInit {
  resource: Resource | null = null;
  selectedSection: any = null;
  completedSections: Set<string> = new Set();
  resourceCompleted: boolean = false;

  // ── Flag para saber si el contenido viene del backend ──
  isFromBackend = false;
  backendContent: EducationContent | null = null;
  isLoading = true;

  // ── Datos locales (los que ya tenías) ──
  private resources: Resource[] = [
    {
      id: 1,
      title: 'Guía de Separación de Residuos',
      description: 'Aprende a separar correctamente los residuos orgánicos, reciclables y especiales.',
      type: 'Guía PDF',
      time: '15 min',
      author: 'Juan Pérez',
      date: '01/11/2025',
      images: [
        '/img/icons/Reciclaje.png',
        'https://picsum.photos/id/1015/800/400',
        'https://picsum.photos/id/1020/800/400',
        'https://picsum.photos/id/1035/800/400'
      ],
      pdfs: [
        { name: 'Guía de Separación de Residuos', url: 'https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf' },
        { name: 'Manual de Clasificación UAESP', url: 'https://www.uaesp.gov.co/content/subdireccion-aprovechamiento' }
      ],
      sections: [
        {
          title: 'Residuos Orgánicos',
          content: 'Incluye restos de comida, cáscaras, café, etc. Los residuos orgánicos son biodegradables y pueden ser aprovechados mediante compostaje. Según la UAESP, el 60% de los residuos sólidos domiciliarios en Bogotá son materia orgánica.',
          icon: 'leaf',
          summary: 'Aprende a identificar residuos orgánicos',
          images: [
            'https://picsum.photos/id/1015/800/400',
            'https://picsum.photos/id/1020/800/400'
          ],
          pdfs: [
            { name: 'Guía de Residuos Orgánicos - UAESP', url: 'https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf' }
          ],
          topics: [
            { title: 'Frutas y verduras', content: 'Se deben colocar en compost o contenedor orgánico.' },
            { title: 'Restos de comida', content: 'Evita mezclarlos con reciclables.' }
          ]
        },
        {
          title: 'Residuos Reciclables',
          content: 'Papel, cartón, plásticos y metales limpios. Estos materiales pueden ser procesados y transformados en nuevos productos. La UAESP recomienda limpiar y secar los materiales antes de depositarlos en los contenedores de reciclaje.',
          icon: 'refresh-cw',
          summary: 'Clasificación de reciclables',
          images: [
            'https://picsum.photos/id/1035/800/400',
            'https://picsum.photos/id/1040/800/400'
          ],
          pdfs: [
            { name: 'Manual de Clasificación de Reciclables', url: 'https://www.uaesp.gov.co/content/subdireccion-aprovechamiento' }
          ],
          topics: [
            { title: 'Plásticos', content: 'Lávalos antes de depositarlos.' },
            { title: 'Cartón', content: 'Debe estar seco y sin restos de comida.' }
          ]
        },
        {
          title: 'Residuos Especiales',
          content: 'Baterías, pilas, electrónicos y químicos requieren tratamiento especial. Estos residuos no deben mezclarse con basura común ya que contienen sustancias peligrosas. Bogotá cuenta con puntos de recolección especializados en diferentes localidades.',
          icon: 'alert-triangle',
          summary: 'Cómo manejar residuos peligrosos',
          images: [
            'https://picsum.photos/id/1045/800/400',
            'https://picsum.photos/id/1050/800/400'
          ],
          pdfs: [
            { name: 'Protocolo de Manejo de Residuos Peligrosos - UAESP', url: 'https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf' }
          ],
          topics: [
            { title: 'Baterías y pilas', content: 'Llévalas a puntos de recolección especializados.' },
            { title: 'Electrónicos', content: 'No deben desecharse en basura común.' }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Introducción al Compostaje',
      description: 'Aprende a transformar tus residuos orgánicos en abono natural para plantas.',
      type: 'Video Tutorial',
      time: '20 min',
      author: 'Ana Gómez',
      date: '05/11/2025',
      images: [
        'https://picsum.photos/seed/201/600/400',
        'https://picsum.photos/seed/202/600/400',
        'https://picsum.photos/seed/203/600/400'
      ],
      pdfs: [
        { name: 'Infografía', url: '/static/guides/plasticos.pdf' }
      ],
      sections: [
        {
          title: 'Qué es el Compostaje',
          content: 'Proceso natural de descomposición de materia orgánica. El compostaje es una técnica milenaria que transforma residuos orgánicos en un abono rico en nutrientes. En Bogotá, la UAESP promueve el compostaje domiciliario como estrategia de reducción de residuos.',
          icon: 'book-open',
          summary: 'Conceptos básicos',
          images: [
            'https://picsum.photos/seed/201/600/400',
            'https://picsum.photos/seed/202/600/400'
          ],
          pdfs: [
            { name: 'Guía de Compostaje Domiciliario - Ambiente Bogotá', url: 'https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf' }
          ],
          topics: [
            { title: 'Definición', content: 'Es el proceso de convertir restos orgánicos en abono.' },
            { title: 'Beneficios', content: 'Mejora la calidad del suelo y reduce residuos.' }
          ]
        },
        {
          title: 'Materiales Compostables',
          content: 'Restos de frutas, verduras, café, cáscaras, hojas secas. Una buena mezcla de materiales verdes (ricos en nitrógeno) y marrones (ricos en carbono) acelera el proceso de descomposición. Mantén una proporción 3:1 de marrones a verdes.',
          icon: 'folder',
          summary: 'Qué materiales usar',
          images: [
            'https://picsum.photos/seed/203/600/400',
            'https://picsum.photos/seed/204/600/400'
          ],
          pdfs: [
            { name: 'Materiales Compostables y No Compostables', url: 'https://www.uaesp.gov.co/content/subdireccion-aprovechamiento' }
          ],
          topics: [
            { title: 'Verdes', content: 'Frescos, húmedos, ricos en nitrógeno.' },
            { title: 'Marrones', content: 'Secos, ricos en carbono: hojas, ramas pequeñas.' }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Tipos de Plástico y su Reciclaje',
      description: 'Identifica los diferentes tipos de plástico y cómo reciclarlos correctamente.',
      type: 'Infografía',
      time: '10 min',
      author: 'Carlos Martínez',
      date: '10/11/2025',
      images: [
        'https://picsum.photos/seed/301/600/400'
      ],
      pdfs: [
        { name: 'Infografía', url: '/static/guides/plasticos.pdf' }
      ],
      sections: [
        {
          title: 'Plásticos PET',
          content: 'Botellas de bebidas, envases de alimentos. El PET (Tereftalato de Polietileno) es uno de los plásticos más comunes y reciclables. Estos productos pueden convertirse en nuevas botellas, fibra textil o películas plásticas. Siempre limpios y sin residuos antes de reciclar.',
          icon: 'image',
          summary: 'Botellas y envases PET',
          images: [
            'https://picsum.photos/seed/301/600/400'
          ],
          pdfs: [
            { name: 'Guía de Reciclaje de Plásticos PET - UAESP', url: 'https://www.uaesp.gov.co/images/Guia-UAESP_SR.pdf' }
          ],
          topics: [
            { title: 'Uso', content: 'Se pueden reciclar y fabricar nuevas botellas.' }
          ]
        },
        {
          title: 'Plásticos HDPE',
          content: 'Envases de detergente, leche, productos de limpieza. El HDPE (Polietileno de Alta Densidad) es resistente y versátil. Una vez reciclado, se convierte en tuberías, cajas plásticas, bolsas resistentes y otros productos duraderos.',
          icon: 'trash-2',
          summary: 'Envases HDPE',
          images: [
            'https://picsum.photos/seed/302/600/400'
          ],
          pdfs: [
            { name: 'Clasificación de Plásticos Reciclables', url: 'https://www.uaesp.gov.co/content/subdireccion-aprovechamiento' }
          ],
          topics: [
            { title: 'Reutilización', content: 'Se usan para tuberías, cajas plásticas.' }
          ]
        }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private educationService: EducationService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      // Buscar en el backend
      this.isFromBackend = true;
      this.educationService.getById(id).subscribe({
        next: (content) => {
          this.backendContent = content;
          this.resource = this.mapBackendToResource(content);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cargando contenido del backend:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  /**
   * Convierte un EducationContent del backend al formato Resource
   * para que el HTML existente lo pueda mostrar sin cambios.
   */
  private mapBackendToResource(content: EducationContent): Resource {
    const isImage = content.fileType === 'IMAGE';
    const isPdf = content.fileType === 'PDF';

    return {
      id: content.id,
      title: content.title,
      description: content.description || 'Contenido educativo sobre gestión de residuos.',
      type: content.fileType,
      time: '',
      author: 'Administrador',
      date: content.createdAt ? new Date(content.createdAt).toLocaleDateString() : '',
      images: isImage ? [content.fileUrl] : [],
      pdfs: isPdf ? [{ name: content.title, url: content.fileUrl }] : [],
      sections: [
        {
          title: content.title,
          content: content.description || 'Contenido educativo subido por el administrador.',
          icon: this.getIconByFileType(content.fileType),
          summary: content.description || 'Haz clic para ver más...',
          images: isImage ? [content.fileUrl] : [],
          pdfs: isPdf ? [{ name: content.title, url: content.fileUrl }] : [],
          topics: []
        }
      ]
    };
  }

  private getIconByFileType(fileType: string): string {
    switch (fileType) {
      case 'PDF': return 'book-open';
      case 'IMAGE': return 'image';
      case 'VIDEO': return 'video';
      default: return 'file';
    }
  }

  goToQuiz() {
    if (!this.resource) return;
    this.router.navigate(['/education', this.resource.id, 'quiz']);
  }

  openModal(section: any) {
    this.selectedSection = section;
  }

  closeModal() {
    this.selectedSection = null;
  }

  selectSection(section: any) {
    this.selectedSection = section;
  }

  selectTopic(topic: any) {
    // Opcional: mostrar contenido del topic en modal o scroll en sidebar
  }

  toggleSectionCompleted(section: any): void {
    const sectionId = section.title;
    if (this.completedSections.has(sectionId)) {
      this.completedSections.delete(sectionId);
    } else {
      this.completedSections.add(sectionId);
    }
  }

  isSectionCompleted(section: any): boolean {
    return this.completedSections.has(section.title);
  }

  toggleResourceCompleted(): void {
    this.resourceCompleted = !this.resourceCompleted;
    if (this.resourceCompleted && this.resource?.sections) {
      this.resource.sections.forEach(section => {
        this.completedSections.add(section.title);
      });
    } else {
      this.completedSections.clear();
    }
  }

  isResourceCompleted(): boolean {
    return this.resourceCompleted;
  }
}
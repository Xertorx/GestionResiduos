
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

export interface Resource {
  id: number;
  title: string;
  description: string;
  type?: string;      // "Guía PDF", "Video", etc.
  time?: string;      // "15 min"
  author?: string;
  date?: string;      // "01/11/2025"
  images?: string[];  // URLs de imágenes
  pdfs?: { name: string; url: string }[];
  sections?: {
    title: string;
    content: string;
    icon?: string;
    summary?: string;
    topics?: { title: string; content?: string }[];
  }[];
}

@Component({
  selector: 'app-education-detail',
 
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './education-detail.html',
  styleUrls: ['./education-detail.scss']
})
export class EducationDetail implements OnInit {
  resource: Resource | null = null;

  // Mocked resources. In a real app you'd fetch this from a service/backend.               
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
        'https://picsum.photos/seed/101/600/400',
        'https://picsum.photos/seed/102/600/400'
      ],
      pdfs: [
        { name: 'Guía PDF', url: '/static/guides/separacion.pdf' },
        { name: 'Checklist', url: '/static/guides/checklist.pdf' }
      ],
      sections: [
        {
          title: 'Residuos Orgánicos',
          content: 'Incluye restos de comida, cáscaras, café, etc.',
          icon: 'leaf', // Lucide icon
          summary: 'Aprende a identificar residuos orgánicos',
          topics: [
            { title: 'Frutas y verduras', content: 'Se deben colocar en compost o contenedor orgánico.' },
            { title: 'Restos de comida', content: 'Evita mezclarlos con reciclables.' }
          ]
        },
        {
          title: 'Residuos Reciclables',
          content: 'Papel, cartón, plásticos y metales limpios.',
          icon: 'refresh-cw', // Lucide icon
          summary: 'Clasificación de reciclables',
          topics: [
            { title: 'Plásticos', content: 'Lávalos antes de depositarlos.' },
            { title: 'Cartón', content: 'Debe estar seco y sin restos de comida.' }
          ]
        },
        {
          title: 'Residuos Especiales',
          content: 'Baterías, pilas, electrónicos y químicos.',
          icon: 'alert-triangle', // Lucide icon
          summary: 'Cómo manejar residuos peligrosos',
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
      pdfs: [],
      sections: [
        {
          title: 'Qué es el Compostaje',
          content: 'Proceso natural de descomposición de materia orgánica.',
          icon: 'info', // Lucide icon
          summary: 'Conceptos básicos',
          topics: [
            { title: 'Definición', content: 'Es el proceso de convertir restos orgánicos en abono.' },
            { title: 'Beneficios', content: 'Mejora la calidad del suelo y reduce residuos.' }
          ]
        },
        {
          title: 'Materiales Compostables',
          content: 'Restos de frutas, verduras, café, cáscaras, hojas secas.',
          icon: 'package', // Lucide icon
          summary: 'Qué materiales usar',
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
          content: 'Botellas de bebidas, envases de alimentos.',
          icon: 'bottle', // Lucide icon
          summary: 'Botellas y envases PET',
          topics: [
            { title: 'Uso', content: 'Se pueden reciclar y fabricar nuevas botellas.' }
          ]
        },
        {
          title: 'Plásticos HDPE',
          content: 'Envases de detergente, leche, productos de limpieza.',
          icon: 'box', // Lucide icon
          summary: 'Envases HDPE',
          topics: [
            { title: 'Reutilización', content: 'Se usan para tuberías, cajas plásticas.' }
          ]
        }
      ]
    }
  ];


  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id) {
      this.resource = this.resources.find(r => r.id === id) ?? null;
    }
  }

  goToQuiz() {
    if (!this.resource) return;
    this.router.navigate(['/education', this.resource.id, 'quiz']);
  }
  selectedSection: any = null;

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
}

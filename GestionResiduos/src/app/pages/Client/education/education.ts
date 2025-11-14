import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule, LucideAngularModule,RouterLink],
  templateUrl: './education.html',
  styleUrls: ['./education.scss'],
  
})
export class Education {
  // 🔹 Estas guías pueden venir luego de tu servicio/BD
 guides = [
  {
    id: 1,
    icon: 'book-open', // Guía PDF
    type: 'Guía PDF',
    title: 'Guía de Separación de Residuos',
    description:
      'Aprende a separar correctamente los residuos orgánicos, reciclables y especiales.',
    image: 'http://static.photos/education/640x360/1',
    time: '15 min',
    button: 'Ver guía',
  },
  {
    id: 2,
    icon: 'video', // Video
    type: 'Video',
    title: 'Introducción al Compostaje',
    description:
      'Aprende a transformar tus residuos orgánicos en abono natural para plantas.',
    image: 'http://static.photos/education/640x360/2',
    time: '8 min',
    button: 'Ver video',
  },
  {
    id: 3,
    icon: 'image', // Infografía
    type: 'Infografía',
    title: 'Tipos de Plástico y su Reciclaje',
    description:
      'Identifica los diferentes tipos de plástico y cómo reciclarlos correctamente.',
    image: 'http://static.photos/education/640x360/3',
    time: '5 min',
    button: 'Ver infografía',
  },
  {
    id: 4,
    icon: 'book-open', // Guía PDF
    type: 'Guía PDF',
    title: 'Manejo de Residuos Peligrosos',
    description:
      'Guía completa para el manejo seguro de residuos peligrosos en el hogar.',
    image: 'http://static.photos/education/640x360/4',
    time: '20 min',
    button: 'Ver guía',
  },
  {
    id: 5,
    icon: 'video', // Video
    type: 'Video',
    title: 'Reduciendo tu Huella Ecológica',
    description:
      'Consejos prácticos para reducir tu impacto ambiental en el día a día.',
    image: 'http://static.photos/education/640x360/5',
    time: '12 min',
    button: 'Ver video',
  },
  {
    id: 6,
    icon: 'image', // Infografía
    type: 'Infografía',
    title: 'Economía Circular en Casa',
    description:
      'Cómo aplicar principios de economía circular en tu hogar y comunidad.',
    image: 'http://static.photos/education/640x360/6',
    time: '7 min',
    button: 'Ver infografía',
  },
];


openModal() {
  Swal.fire({
    title: "Gracias Por daros tu Opinion",
  icon: "success",
  draggable: true
  });
}

}

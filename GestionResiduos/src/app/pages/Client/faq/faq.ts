import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './faq.html',
})
export class Faq {
  categories: { label: string; items: FaqItem[] }[] = [
    {
      label: 'Cuenta y Registro',
      items: [
        {
          question: '¿Cómo creo una cuenta en EcoBolívar?',
          answer: 'Ve a la sección de Registro, completa el formulario con tu correo y contraseña, luego verifica tu correo haciendo clic en el enlace que te enviamos.',
          open: false,
        },
        {
          question: '¿Puedo registrarme con Google?',
          answer: 'Sí. En la pantalla de registro hay un botón "Continuar con Google" que te permite crear tu cuenta directamente con tu cuenta de Gmail.',
          open: false,
        },
        {
          question: '¿Olvidé mi contraseña, qué hago?',
          answer: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Recibirás un correo con un enlace para restablecerla.',
          open: false,
        },
      ],
    },
    {
      label: 'Eco-Puntos y Reciclaje',
      items: [
        {
          question: '¿Qué es un eco-punto?',
          answer: 'Un eco-punto es un lugar físico en Ciudad Bolívar donde puedes depositar materiales reciclables como plástico, vidrio, papel o electrónicos. Puedes encontrarlos en el mapa de la plataforma.',
          open: false,
        },
        {
          question: '¿Cómo encuentro el eco-punto más cercano?',
          answer: 'En la sección "Eco-Puntos" encontrarás un mapa interactivo con todos los puntos activos. Puedes filtrar por tipo de residuo o por barrio.',
          open: false,
        },
        {
          question: '¿Puedo ganar puntos por reciclar?',
          answer: 'Sí. Al registrar acciones de reciclaje en la plataforma, acumulas ecopuntos que puedes consultar en tu perfil y que aparecen en el ranking de la comunidad.',
          open: false,
        },
      ],
    },
    {
      label: 'Reportes',
      items: [
        {
          question: '¿Cómo reporto un problema de residuos en mi barrio?',
          answer: 'Ve a la sección "Reportes", haz clic en "Nuevo Reporte", adjunta una foto si deseas, indica la ubicación y describe el problema. Recibirás actualizaciones sobre el estado de tu reporte.',
          open: false,
        },
        {
          question: '¿Cuánto tarda en resolverse un reporte?',
          answer: 'El tiempo varía según la prioridad y los recursos disponibles. Puedes seguir el estado de tu reporte en tiempo real desde la sección de Reportes.',
          open: false,
        },
      ],
    },
    {
      label: 'Calendario y Recolección',
      items: [
        {
          question: '¿Cómo sé qué días pasa el camión de basura por mi barrio?',
          answer: 'En la sección "Calendario" puedes consultar los días y horarios de recolección por localidad. Puedes activar recordatorios para recibir notificaciones.',
          open: false,
        },
        {
          question: '¿El calendario se actualiza en tiempo real?',
          answer: 'Sí. El equipo administrador actualiza el calendario cuando hay cambios en las rutas o días de recolección.',
          open: false,
        },
      ],
    },
    {
      label: 'Educación Ambiental',
      items: [
        {
          question: '¿Qué contenidos educativos ofrece la plataforma?',
          answer: 'En la sección "Educación" encontrarás artículos, guías y quizzes sobre reciclaje, manejo de residuos especiales, compostaje y buenas prácticas ambientales.',
          open: false,
        },
        {
          question: '¿Los quizzes tienen recompensas?',
          answer: 'Al completar quizzes obtienes ecopuntos que se suman a tu perfil y contribuyen a tu posición en el ranking comunitario.',
          open: false,
        },
      ],
    },
  ];

  toggle(catIdx: number, itemIdx: number): void {
    const item = this.categories[catIdx].items[itemIdx];
    item.open = !item.open;
  }
}

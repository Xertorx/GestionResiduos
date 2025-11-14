import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Respuesta {
  usuario: string;
  texto: string;
  fecha: string;
}

interface Comentario {
  usuario: string;
  texto: string;
  fecha: string;
  respuestas?: Respuesta[];
}


@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './detalles.html',
  styleUrls: ['./detalles.scss']
})
export class Detalles implements OnInit {
  tema: any;
  comentarios: Comentario[] = [
    {
      usuario: 'María',
      texto: 'Me encanta este tema, aprendí mucho.',
      fecha: '16/10/2025',
      respuestas: []
    },
    {
      usuario: 'Carlos',
      texto: 'Yo uso bolsas separadas para plásticos y vidrios.',
      fecha: '17/10/2025',
      respuestas: []
    }
  ];

  mostrarModal = false;
  comentarioSeleccionado: any = null;
  textoRespuesta: string = '';
  textoComentario: string = '';
  mensajeExito: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.tema = {
      id,
      titulo: 'Cómo separar los residuos correctamente',
      descripcion: 'Comparte tus consejos sobre separación de residuos en casa.',
      autor: 'Admin',
      fecha: '15/10/2025'
    };
  }

  abrirModal(comentario: any) {
    this.comentarioSeleccionado = comentario;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.textoRespuesta = '';
  }

  enviarRespuesta() {
    if (this.textoRespuesta.trim()) {
      const nuevaRespuesta = {
        usuario: 'Tú', // En un caso real, se obtendría del usuario autenticado
        texto: this.textoRespuesta,
        fecha: new Date().toLocaleDateString()
      };

      // Agregar la respuesta al comentario seleccionado
      this.comentarioSeleccionado.respuestas =
        this.comentarioSeleccionado.respuestas || [];
      this.comentarioSeleccionado.respuestas.push(nuevaRespuesta); // Cuando se tenga el back, se le asocia esta respuesta al Id del comentario

      // Mostrar mensaje de éxito
      this.mensajeExito = 'Tu respuesta se ha guardado correctamente.';

      // Ocultar el mensaje luego de 3 segundos
      setTimeout(() => (this.mensajeExito = null), 3000);

      // Cerrar el modal
      this.cerrarModal();
    }
  }
  
  enviarComentario() {
    if (this.textoComentario.trim()) {
      const nuevoComentario: Comentario = {
        usuario: 'Tú', // En un caso real, se obtendría del usuario autenticado
        texto: this.textoComentario,
        fecha: new Date().toLocaleDateString(),
        respuestas: []
      };
      this.comentarios.push(nuevoComentario);
      this.textoComentario = '';
      this.mensajeExito = 'Tu comentario se ha guardado correctamente.';
      setTimeout(() => (this.mensajeExito = null), 3000);
    }
  }

  crearNuevoTema() {
    // Método placeholder para nuevos temas si es necesario
  }

  // feedback modal removed per request; success messages used instead

  volverAlForo() {
    this.router.navigate(['/foro']).then(() => {
      window.location.reload();
    });
  }
}

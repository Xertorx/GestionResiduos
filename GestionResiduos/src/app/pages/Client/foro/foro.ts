import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';

interface Tema {
  id: number;
  titulo: string;
  descripcion: string;
  comentarios: number | null;
}

@Component({
  selector: 'app-foro',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './foro.html',
  styleUrl: './foro.scss'
})
export class Foro implements OnInit {
  mostrandoDetalles = signal(false);
  temas = [
    { id: 1, titulo: 'Cómo separar los residuos correctamente', descripcion: 'Comparte tus consejos sobre separación de residuos.', comentarios: 3  },
    { id: 2, titulo: 'Ideas para reciclar en casa', descripcion: 'Discute formas creativas de reciclar materiales comunes.', comentarios: 5 }
  ];

  constructor(private router: Router, private route: ActivatedRoute) { }

  nuevoTema: string = '';
  tituloTema: string = '';
  mensajeExito: string | null = null;

  ngOnInit() {
    this.route.firstChild?.params.subscribe(() => {
      this.mostrandoDetalles.set(true);
    });
  }

  verTema(id: number) {
    this.mostrandoDetalles.set(true);
    this.router.navigate(['/foro', id]);
  }

  crearNuevoTema() {
    if (this.nuevoTema.trim() && this.tituloTema.trim()) {
      const nuevoId = this.temas.length + 1;
      this.temas.push({
        id: nuevoId,
        titulo: this.tituloTema,
        descripcion: this.nuevoTema,
        comentarios: 0
      });
      this.nuevoTema = '';
      this.tituloTema = '';
    
      this.mensajeExito = 'Tu nuevo tema se ha creado correctamente.';
      setTimeout(() => (this.mensajeExito = null), 3000);
    }
  }
}

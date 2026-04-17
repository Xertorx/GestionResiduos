import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthStateService } from '../../../../services/auth-state.service';
import { ApiService } from '../../../../services/api.service';

@Component({
  selector: 'app-detalles',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './detalles.html',
  styleUrls: ['./detalles.scss']
})
export class Detalles implements OnInit, OnDestroy {
  tema: any = null;
  isAuthenticated = false;
  authReady = false;
  isLoadingTema = false;
  isLoadingComments = false;
  private subs = new Subscription();

  comentarios: any[] = [];

  mostrarModal = false;
  comentarioSeleccionado: any = null;
  textoRespuesta = '';
  textoComentario = '';
  isSendingComment = false;
  isSendingReply = false;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authState: AuthStateService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.subs.add(this.authState.initialized$.subscribe(v => {
      this.authReady = v;
      if (v) {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
          this.loadTopic(id);
          this.loadComments(id);
        }
      }
    }));
    this.subs.add(this.authState.isLoggedIn$.subscribe(v => this.isAuthenticated = v));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private loadTopic(id: number): void {
    this.isLoadingTema = true;
    this.api.getTopicById(id).subscribe({
      next: (data) => { this.tema = data; this.isLoadingTema = false; },
      error: () => { this.isLoadingTema = false; this.mensajeError = 'No se pudo cargar el tema.'; }
    });
  }

  private loadComments(topicId: number): void {
    this.isLoadingComments = true;
    this.api.getTopicComments(topicId).subscribe({
      next: (data) => { this.comentarios = data; this.isLoadingComments = false; },
      error: () => { this.isLoadingComments = false; }
    });
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
    if (!this.textoRespuesta.trim() || !this.comentarioSeleccionado) return;
    this.isSendingReply = true;

    this.api.addReply(this.comentarioSeleccionado.id, this.textoRespuesta.trim()).subscribe({
      next: () => {
        this.isSendingReply = false;
        this.mensajeExito = 'Tu respuesta se ha guardado correctamente.';
        setTimeout(() => (this.mensajeExito = null), 3000);
        this.cerrarModal();
        this.loadComments(this.tema.id);
      },
      error: () => {
        this.isSendingReply = false;
        this.mensajeError = 'No se pudo enviar la respuesta.';
        setTimeout(() => (this.mensajeError = null), 4000);
      }
    });
  }

  enviarComentario() {
    if (!this.textoComentario.trim() || !this.tema) return;
    this.isSendingComment = true;

    this.api.addComment(this.tema.id, this.textoComentario.trim()).subscribe({
      next: () => {
        this.textoComentario = '';
        this.isSendingComment = false;
        this.mensajeExito = 'Tu comentario se ha guardado correctamente.';
        setTimeout(() => (this.mensajeExito = null), 3000);
        this.loadComments(this.tema.id);
      },
      error: () => {
        this.isSendingComment = false;
        this.mensajeError = 'No se pudo enviar el comentario.';
        setTimeout(() => (this.mensajeError = null), 4000);
      }
    });
  }

  volverAlForo() {
    this.router.navigate(['/foro']).then(() => {
      window.location.reload();
    });
  }
}

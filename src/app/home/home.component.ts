import { Component } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { ApuestaService } from '../services/apuesta.service';
import { Apuesta } from '../models/apuestas/Apuesta';
import { ApuestaReaction } from '../models/apuestas/ApuestaReaction';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  username: string = '';
  apuestaNombre: string = '';
  apuestaDescripcion: string = '';
  apuestaLink: string = '';
  apuestas: Apuesta[] = [];
  modoBusquedaActiva: boolean = false;

  paginaActual: number = 0;
  tamañoPagina: number = 10;
  totalPaginas: number = 0;


  constructor(
    private storageService: StorageService,
    private apuService: ApuestaService
  ) {
    this.username = this.storageService.getSession('user');
    console.log('Usuario:', this.username);
    this.getApuestas();
  }

  getApuestas() {
    this.apuService.getApuestas(this.paginaActual, this.tamañoPagina).subscribe(res => {
      this.apuestas = res.content;
      this.totalPaginas = res.totalPages;

      this.apuestas.forEach((apuesta) => {
        this.apuService.getReaccionMasVotada(apuesta.id).subscribe({
          next: (reaccion) => (apuesta.reaccionMasVotada = reaccion),
          error: () => (apuesta.reaccionMasVotada = 'Sin votos')
        });

        this.cargarComentarios(apuesta);
      });
    });
  }
 terminoBusqueda: string = '';
 buscarApuestas() {
    if (!this.terminoBusqueda || this.terminoBusqueda.trim() === '') {
      this.limpiarBusqueda();
      return;
    }

    this.modoBusquedaActiva = true;
 this.apuService.buscarApuestas(this.terminoBusqueda).subscribe({
      next: (res: any) => {
        this.apuestas = res;
        this.totalPaginas = 1;
        this.paginaActual = 0;

        this.apuestas.forEach((apuesta) => {
          this.apuService.getReaccionMasVotada(apuesta.id).subscribe({
            next: (reaccion) => (apuesta.reaccionMasVotada = reaccion),
            error: () => (apuesta.reaccionMasVotada = 'Sin votos')
          });

          this.cargarComentarios(apuesta);
        });
      },
      error: (err) => console.error('Error al buscar canciones:', err)
    });
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.modoBusquedaActiva = false;
    this.getApuestas();
  }

  addApuesta() {
    const nuevo: Apuesta = {
      id: 0,
      nombre: this.apuestaNombre,
      descripcion: this.apuestaDescripcion,
      link: this.apuestaLink,
      postedBy: null
    };

    console.log('Apuesta agregada:', nuevo);
    this.apuService.postApuesta(nuevo).subscribe((respuesta: any) => {
      console.log('Apuesta agregada:', respuesta);
      this.getApuestas();
    });
  }


  reaccionar(apuestaId: number, reactionId: number) {
      const reaccion: ApuestaReaction = {
      apuestaId: apuestaId,
      reactionId: reactionId,
    };

    this.apuService.postReaccion(reaccion).subscribe({
      next: (res) => {
        console.log('Reacción enviada:', res);
        this.getApuestas(); // recargar para ver la reacción más votada actualizada
      },
      error: (err) => {
        console.error('Error al enviar reacción:', err);
      }
    });
  }

  cargarComentarios(apuesta: Apuesta) {
      this.apuService.getComentariosPorApuesta(apuesta.id).subscribe({
      next: (comentarios) => {
        apuesta.comentarios = comentarios;
      },
      error: (err) => {
        console.error(`Error al cargar comentarios para la canción ${apuesta.id}`, err);
      }
    });
  }

  crearComentario(apuesta: Apuesta) {
    if (!apuesta.nuevoComentario || apuesta.nuevoComentario.trim() === '') return;

    const comentario = {
      contenido: apuesta.nuevoComentario,
      apuestaId: apuesta.id
    };

    this.apuService.postComentario(comentario).subscribe({
      next: () => {
        apuesta.nuevoComentario = '';
        this.cargarComentarios(apuesta);
      },
      error: (err) => {
        console.error('Error al crear comentario:', err);
      }
    });
  }
}



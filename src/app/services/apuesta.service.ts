import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { StorageService } from './storage.service';
import { Apuesta } from '../models/apuestas/Apuesta';
import { ApuestaReaction } from '../models/apuestas/ApuestaReaction';

@Injectable({
  providedIn: 'root',
})
export class ApuestaService {
  apiURL = 'https://apuestas-spring.onrender.com';
  token = '';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.token = this.storageService.getSession('token');
    console.log(this.token);
  }



  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      Authorization: 'Bearer ' + this.token,
    }),
  };

  errorMessage = '';
  getHttpOptions() {
    const token = this.storageService.getSession('token'); // lee porque si no se me traba por alguna razon
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      }),
    };
  }
  postApuesta(myApuesta: Apuesta): Observable<any> {
    return this.http
      .post(this.apiURL + 'api/apuesta/create', myApuesta, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
  postReaccion(reactionRequest: ApuestaReaction): Observable<any> {
    return this.http.post(
      this.apiURL + 'api/reactions/create',
      reactionRequest,
      this.getHttpOptions()
    ).pipe(catchError(this.handleError));
  }

  getApuestas(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(
      `${this.apiURL}api/apuesta/all?page=${page}&size=${size}`,
      this.getHttpOptions()
    ).pipe(retry(1), catchError(this.handleError));
  }

  getReaccionMasVotada(apuestaId: number): Observable<string> {
  return this.http.get(`https://apuestas-spring.onrender.com/api/reactions/most-voted/${apuestaId}`, {
        responseType: 'text'
    });
  }
  postComentario(comentario: { contenido: string; apuestaId: number }): Observable<any> {
    return this.http.post(this.apiURL + 'api/comentarios/create', comentario, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  getComentariosPorApuesta(apuestaId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL + `api/comentarios/get/${apuestaId}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
  buscarApuestas(termino: string): Observable<Apuesta[]> {
    return this.http.get<Apuesta[]>(`https://apuestas-spring.onrender.com/api/apuesta/buscar?termino=${termino}`);
  }
  deleteApuesta(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiURL}api/apuesta/delete/${id}`,
      {
        ...this.getHttpOptions(),
        responseType: 'text' as 'json'
      }
    ).pipe(
      catchError(this.handleError)
    );
  }

  handleError(error: any) {
    let errorMessage = '';

    if (error.status === 401) {
      errorMessage = 'Ya has votado en esta apuesta';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para borrar esta apuesta.';
    } else if (error.status === 404) {
      errorMessage = 'La apuesta no fue encontrada.';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }

    console.error('Error desde handleError:', errorMessage);

    Swal.fire({
      icon: 'error',
      title: '¡Ups!',
      text: errorMessage,
      confirmButtonColor: '#d33'
    });

    return throwError(() => errorMessage);
  }


}
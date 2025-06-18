export class Apuesta {
  id: number = 0;
  nombre: string = '';
  descripcion: string = '';
  link: string = '';
  postedBy: {
    id: number;
    username: string;
  } | null = null;
  reaccionMasVotada?: string;
  comentarios?: { id: number; contenido: string; nombreUsuario: string }[] = [];
  nuevoComentario?: string = '';
}

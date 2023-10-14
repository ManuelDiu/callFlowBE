import { EstadoPostulante } from "entities/estadoPostulante/estadoPostulante.entity";
import { EstadoPostulanteEnum } from "enums/EstadoPostulanteEnum";

export type UpdatePostulanteInput = {
  id: number;
  postulante: PostulanteType;
};

export type InfoPostulanteEnLlamadoInput = {
  llamadoId: number;
  postulanteId: number;
};

export type CambiarEstadoPostulanteLlamadoInput = {
  llamadoId: number;
  postulanteId: number;
  solicitanteId: number;
  nuevoEstado: EstadoPostulanteEnum;
};

export type DeletePostulanteInput = {
  id: number;
};

export type PostulanteType = {
  nombres: string;
  apellidos: string;
  documento: string;
};

export type PostulanteList = {
  id: number;
  nombres: string;
  apellidos: string;
  documento: string;
  updatedAt: Date;
};

export type UpdatePostulanteResponse = {
  ok: Boolean;
  message: string;
  postulante?: PostulanteType;
};

export type EstadoData = {
  id: number;
  nombre: string;
  updatedAt: Date;
};

export type PostulanteInLlamadoResumed = {
  postulante: PostulanteList;
  estadoActual: EstadoData;
  etapa: EtapaListResumed;
  updatedAt: Date;
};

type EtapaListResumed = {
  id: number;
  nombre: string;
  plazoDias: number;
  puntajeMin: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AddFileToPostulante = {
  nombre: string;
  url: string;
  extension: string;
  tipoArchivo: number;
  postulanteId: number;
  llamadoId: number;
  solicitanteId: number;
};
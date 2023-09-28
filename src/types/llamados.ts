import { TipoMiembro } from 'enums/TipoMiembro';
import { CargoList } from './cargo';

export type LlamadoList = {
  id: number;
  nombre: String;
  estado: String;
  ultimaModificacion: String;
  ref: string;
  cupos: number;
  cargo: CargoList;
  postulantes: number;
  progreso: number;
};

export type Requisito = {
  index?: number;
  nombre: string;
  puntaje: number;
  excluyente: boolean;
};

export type SubEtapa = {
  index?: number;
  nombre: string;
  subtotal: number;
  puntajeMaximo: number;
  requisitos: Requisito[];
};

export type Etapa = {
  index?: number;
  nombre: string;
  plazoDiasMaximo: number;
  puntajeMinimo: number;
  subetapas: SubEtapa[];
};

export type LlamadoCreateData = {
  nombre: string;
  referencia: string;
  cantidadHoras: number;
  cupos: number;
  cargo: number;
  itr: string;
  solicitante: number;
  enviarEmailTodos: boolean;
};

export type TribunalCreate = {
  id: number;
  type: TipoMiembro;
  order: number;
};

export type LLamaodCreateInput = {
  tribunales: TribunalCreate[];
  postulantes: number[];
  llamadoInfo: LlamadoCreateData;
  etapas: Etapa[];
};

export type LlamadoCreateResponse = {
  ok: boolean;
  message: string;
};
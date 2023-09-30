import { TipoMiembro } from 'enums/TipoMiembro';
import { CargoList } from './cargo';
import { Etapa } from './llamados';

export type TemplateList = {
  id?: number;
  nombre: String;
  color: string;
  cargo: CargoList,
  etapas: number,
};

export type TemplateCreateInput = {
  etapas: Etapa[];
  color: string;
  cargo: number,
  nombre: string,
};

export type TemplateCreateResponse = {
  ok: boolean;
  message: string;
};


export type RequisitoList = {
  nombre: string,
  puntajeSugerido: number,
  excluyente: boolean,
}

export type SubEtapaList = {
  nombre: string
  puntajeTotal: number,
  puntajeMaximo: number,
  requisitos: RequisitoList[]
}

export type EtapaList = {
  nombre: string,
  plazoDias: number,
  puntajeMin: number,
  total: number,
  subetapas: SubEtapaList[]
}

export type TemplateInfo = {
  id: number,
  nombre: string,
  cargo: CargoList,
  etapa: EtapaList[],
  color: string,
  activo: boolean,
}
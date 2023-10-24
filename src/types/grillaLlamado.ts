export type DataGrilla = {
  postulanteId: number;
  llamadoId: number;
  requisitos: RequisitoGrilla[];
};

export type RequisitoGrilla = {
  id?: number;
  nuevoPuntaje: number;
};

export type RequisitoType = {
  id?: number,
  nombre: string;
  puntajeSugerido: number;
  puntaje: number;
  excluyente: boolean;
};

export type SubEtapaGrilla = {
  id?: number,
  nombre: string;
  subtotal: number;
  puntajeMaximo: number;
  requisitos: RequisitoType[];
};

export type EtapaGrilla = {
  id?: number,
  nombre: string;
  plazoDias: number;
  total: number;
  puntajeMin: number;
  currentEtapa: number
  cantEtapas: number
  subetapas: SubEtapaGrilla[];
};

export type AvanzarEtapaData = {
  postulanteId: number;
  llamadoId: number;
  currentEtapa: number
};

export type CurrentEtapaData = {
  currentEtapa: EtapaGrilla;
  allEtapas: EtapaGrilla[];
};

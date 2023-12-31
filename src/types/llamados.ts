import { TipoMiembro } from "enums/TipoMiembro";
import { CargoList } from "./cargo";
import { EstadoLlamadoEnum } from "enums/EstadoLlamadoEnum";
import { PostulanteList } from "./posstulante";

export type LlamadoList = {
  id: number;
  nombre: String;
  estado: String;
  ultimaModificacion: String;
  ref: string;
  cupos: number;
  itr?: String;
  cargo: CargoList;
  postulantes: number;
  progreso: number;
};

export type PaginationLlamado = {
  llamados: LlamadoList[];
  totalPages: number;
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
  categorias: number[];
};

export type LlamadoCreateResponse = {
  ok: boolean;
  message: string;
};

export type AddFileToLlamado = {
  nombre: string;
  url: string;
  extension: string;
  tipoArchivo: number;
  llamadoId: number;
};

export type AddFileToLlamadoFirma = {
  nombre: "Grilla" | "Acta";
  url: string;
  extension: string;
  tipoArchivo: number;
  llamadoId: number;
};

export type FirmarArchivoInput = {
  archivoFirmaId: number;
  url: string;
};

export type CambiarEstadoLlamadoInput = {
  llamadoId: number;
  etapa: number;
  estado: EstadoLlamadoEnum;
};

export type CambiarCambioLlamadoInput = {
  historialItemId: number;
  cambioId: number;
  accept: boolean;
};

export type EtapaResumed = {
  id?: number;
  nombre: string;
  plazoDias: number;
  puntajeMin: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
};

export type RenunciarLlamadoInput = {
  llamadoId: number;
  userId: number;
  motivoRenuncia: string;
};

export type ListarLlamadoInputQuery = {
  selectedCategorias: number[];
  selectedCargos: number[];
  selectedPostulantes: number[];
  selectedUsuarios: number[];
  selectedEstados: string[];
  selectedITRs: string[];
};

export type PaginationInput = {
  offset: number;
  currentPage: number;
};

export type CambiarTribunalInput = {
  id: number;
  tipoMiembro: string;
  orden: number;
};

export type AddPostulanteToLlamado = {
  postulanteId: number;
  llamadoId: number;
};

export type EstadisticasGet = {
  llamadosEnProceso: number;
  llamadosFinalizados: number;
  nuevosPostulantes: number;
  llamadosRecientes: any[];
  postulantesRecientes: PostulanteList[];
  cantidadCargos: any[];
};

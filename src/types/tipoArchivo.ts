import { TipoArchivoOrigen } from "enums/TipoArchivoOrigen";
export type TipoArchivoType = {
  nombre: string;
  origen: TipoArchivoOrigen;
};

export type UpdateTipoArchivoInput = {
  id: number;
  tipoArchivo: TipoArchivoType;
};

export type DeleteTipoArchivoInput = {
  id: number;
};

export type TipoArchivoListItem = {
  id: number;
  nombre: string;
  origen: TipoArchivoOrigen;
  updatedAt: Date;
};

export type UpdateTipoArchivoResponse = {
  ok: Boolean;
  message: string;
  tipoArchivo?: TipoArchivoType;
};

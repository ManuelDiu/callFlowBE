export type UpdatePostulanteInput = {
  id: number;
  postulante: PostulanteType;
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

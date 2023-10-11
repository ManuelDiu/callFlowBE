export type DataGrilla = {
  postulanteId: number;
  llamadoId: number;
  requisitos: RequisitoGrilla[];
};

export type RequisitoGrilla = {
  id?: number;
  nuevoPuntaje: number;
};

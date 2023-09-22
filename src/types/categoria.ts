export type UpdateCategoriaInput = {
  idCategoria: number;
  categoria: CategoriaType;
};

export type DeleteCategoriaInput = {
  idCategoria: number;
};

export type CategoriaType = {
  nombre: string;
};

export type UpdateCategoryResponse = {
  ok: Boolean;
  message: string;
  categoria?: CategoriaType;
};

export type AddCategoriesToLlamadoType = {
  llamadoId: number;
  categorias: [CategoriaType];
};

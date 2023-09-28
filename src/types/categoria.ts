export type UpdateCategoriaInput = {
  id: number;
  categoria: CategoriaType;
};

export type DeleteCategoriaInput = {
  id: number;
};

export type CategoriaType = {
  nombre: string;
};

export type CategoriaListItem = {
  id: number;
  nombre: string;
  updatedAt: Date;
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

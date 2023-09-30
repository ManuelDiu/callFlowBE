import { gql } from "apollo-server-express";

const categoriaSchema = gql`
  scalar Date

  input CategoriaItem {
    nombre: String!
  }

  input addCSToLlamadoInput {
    llamadoId: Int!
    categorias: [CategoriaItem]!
  }

  input UpdateCategoryInput {
    id: Int!
    categoria: CategoriaItem!
  }

  input DeleteCategoryInput {
    id: Int!
  }

  type CategoriaItemOutput {
    nombre: String!
  }

  type CategoriaListItemOutput {
    id: Int!
    nombre: String!
    updatedAt: Date!
  }

  type CategorySubOutput {
    categoria: CategoriaListItemOutput!
    operation: String!
  }

  type UpdateCategoryResponse {
    ok: Boolean
    message: String
    categoria: CategoriaItemOutput
  }

  type MessageResponse {
    ok: Boolean
    message: String
  }

  type Mutation {
    """
    Crear una categoría.
    """
    createCategory(data: CategoriaItem!): MessageResponse

    """
    Agregar categorías a un llamado existente por su ID.
    """
    addCategoriesToLlamado(data: addCSToLlamadoInput!): MessageResponse

    """
    Actualizar una categoría.
    """
    updateCategory(data: UpdateCategoryInput!): UpdateCategoryResponse

    """
    Eliminar una categoría.
    """
    deleteCategory(data: DeleteCategoryInput!): MessageResponse
  }

  type Query {
    """
    Listar categorías.
    """
    listCategorias: [CategoriaListItemOutput]
  }

  type Subscription {
    categoryCreated: CategorySubOutput
  }
`;

export default categoriaSchema;

import { gql } from "apollo-server-express";

const tipoArchivoSchema = gql`
  scalar Date

  input TipoArchivoItem {
    nombre: String!
    origen: String!
  }

  input UpdateTipoArchivoInput {
    id: Int!
    tipoArchivo: TipoArchivoItem!
  }

  input DeleteTipoArchivoInput {
    id: Int!
  }

  type TipoArchivoItemOutput {
    nombre: String!
    origen: String!
  }

  type TipoArchivoItemListOutput {
    id: Int!
    nombre: String!
    origen: String!
    updatedAt: Date!
  }

  type TipoArchivoSubOutput {
    tipoArchivo: TipoArchivoItemListOutput!
    operation: String!
  }

  type UpdateTipoArchivoResponse {
    ok: Boolean!
    message: String
    tipoArchivo: TipoArchivoItemOutput
  }

  type MessageResponse {
    ok: Boolean
    message: String
  }

  type Mutation {
    """
    Crear un tipo de archivo.
    """
    createTipoArchivo(data: TipoArchivoItem!): MessageResponse

    """
    Actualizar un tipo de archivo.
    """
    updateTipoArchivo(data: UpdateTipoArchivoInput!): UpdateTipoArchivoResponse

    """
    Eliminar un tipo de archivo.
    """
    deleteTipoArchivo(data: DeleteTipoArchivoInput!): MessageResponse
  }

  type Query {
    """
    Listar tipos de archivo.
    """
    listTiposArchivo: [TipoArchivoItemListOutput]
  }

  type Subscription {
    tipoArchivoCreated: TipoArchivoSubOutput
  }
`;

export default tipoArchivoSchema;

import { gql } from "apollo-server-express";

const postulanteSchema = gql`
  scalar Date

  input PostulanteItem {
    nombres: String!
    apellidos: String
    documento: String!
  }

  input UpdatePostulanteInput {
    id: Int!
    postulante: PostulanteItem!
  }

  input DeletePostulanteInput {
    id: Int!
  }

  type PostulanteItemOutput {
    nombres: String!
    apellidos: String
    documento: String!
  }

  type PostulanteListItemOutput {
    id: Int!
    nombres: String!
    apellidos: String
    documento: String!
    updatedAt: Date!
  }

  type PostulanteSubOutput {
    postulante: PostulanteListItemOutput!
    operation: String!
  }

  type UpdatePostulanteResponse {
    ok: Boolean
    message: String
    postulante: PostulanteItemOutput
  }

  type MessageResponse {
    ok: Boolean
    message: String
  }

  type Mutation {
    """
    Crear un postulante.
    """
    createPostulante(data: PostulanteItem!): MessageResponse

    """
    Actualizar un postulante.
    """
    updatePostulante(data: UpdatePostulanteInput!): UpdatePostulanteResponse

    """
    Eliminar un postulante.
    """
    deletePostulante(data: DeletePostulanteInput!): MessageResponse
  }

  type Query {
    """
    Listar postulantes.
    """
    listarPostulantes: [PostulanteListItemOutput]
  }

  type Subscription {
    postulanteCreated: PostulanteSubOutput
  }
`;

export default postulanteSchema;

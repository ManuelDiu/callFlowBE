import { gql } from "apollo-server-express";

const archivoSchema = gql`
  input AddFileLlamadoInput {
    nombre: String!
    url: String!
    extension: String!
    tipoArchivo: Int!
    llamadoId: Int!
  }

  input AddFilePostulanteInput {
    nombre: String!
    url: String!
    extension: String!
    tipoArchivo: Int!
    llamadoId: Int!
    postulanteId: Int!
    solicitanteId: Int!
  }

  type Mutation {
    addFileToLlamado(info: AddFileLlamadoInput): LlamadoResponseOk
    addFileToPostulante(info: AddFilePostulanteInput): MessageResponse
    deleteArchivo(archivoId: Int): MessageResponse
  }
`;

export default archivoSchema;

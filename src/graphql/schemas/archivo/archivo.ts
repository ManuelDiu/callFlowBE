import { gql } from "apollo-server-express";

const archivoSchema = gql`
  enum TipoArchivoFirma {
    Grilla
    Acta
  }

  input AddFileLlamadoInput {
    nombre: String!
    url: String!
    extension: String!
    tipoArchivo: Int!
    llamadoId: Int!
  }

  input AddFileLlamadoInputFirma {
    nombre: TipoArchivoFirma!
    url: String!
    extension: String!
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

  input FirmarArchivoInput {
    archivoFirmaId: Int!
    url: String!
  }

  type Mutation {
    addFileToLlamado(info: AddFileLlamadoInput): LlamadoResponseOk
    addFileToPostulante(info: AddFilePostulanteInput): MessageResponse
    addArchivoFirmaToLlamado(info: AddFileLlamadoInputFirma): LlamadoResponseOk
    deleteArchivo(archivoId: Int): MessageResponse
    firmarArchivo(info: FirmarArchivoInput): MessageResponse
  }
`;

export default archivoSchema;

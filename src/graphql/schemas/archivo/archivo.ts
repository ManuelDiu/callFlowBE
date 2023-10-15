import { gql } from 'apollo-server-express';

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
  type Mutation {
    addFileToLlamado(info: AddFileLlamadoInput): LlamadoResponseOk
    addArchivoFirmaToLlamado(info: AddFileLlamadoInputFirma): LlamadoResponseOk
    deleteArchivo(archivoId: Int): MessageResponse
  }
`;

export default archivoSchema;

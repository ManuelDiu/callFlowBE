import { gql } from 'apollo-server-express';

const archivoSchema = gql`
  input AddFileLlamadoInput {
    nombre: String!
    url: String!
    extension: String!
    tipoArchivo: Int!
    llamadoId: Int!
  }
  type Mutation {
    addFileToLlamado(info: AddFileLlamadoInput): LlamadoResponseOk
    deleteArchivo(archivoId: Int): MessageResponse
  }
`;

export default archivoSchema;

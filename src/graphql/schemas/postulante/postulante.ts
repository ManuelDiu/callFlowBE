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

  input CambiarEstadoPostulanteLlamadoInput {
    llamadoId: Int!
    postulanteId: Int!
    solicitanteId: Int!
    nuevoEstado: String!
    descripcion: String
  }

  input DataGrillaInput {
    postulanteId: Int!
    llamadoId: Int!
    requisitos: [RequisitoGrillaInput]!
  }

  input RequisitoGrillaInput {
    id: Int!
    nuevoPuntaje: Int!
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

  type CargoData {
    id: Int!
    nombre: String!
    tips: String
    updatedAt: Date
  }

  type LlamadoData {
    id: Int!
    nombre: String!
    referencia: String!
    cantidadHoras: Int!
    cupos: Int!
    itr: String!
    cargo: CargoData!
    updatedAt: Date!
  }

  type ArchivoData {
    id: Int!
    nombre: String!
    url: String!
    extension: String!
    updatedAt: Date!
  }

  type EstadoData {
    id: Int!
    nombre: String!
    updatedAt: Date!
  }

  type PostulanteLlamadoFull {
    id: Int!
    postulante: PostulanteListItemOutput!
    llamado: LlamadoData!
    archivos: [Archivo]!
    estadoActual: EstadoData!
    updatedAt: Date!
    descripcion: String
  }

  type PostulanteInLlamadoResumed {
    postulante: PostulanteListItemOutput!
    estadoActual: EstadoData!
    etapa: EtapaListResumed
    updatedAt: Date!
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

    """
    Cambiar el estado de un postulante en un llamado (endpoint de uso exclusivo para Admins)
    """
    cambiarEstadoPostulanteLlamado(
      data: CambiarEstadoPostulanteLlamadoInput!
    ): MessageResponse
    """
    Cambiar el estado de un postulante en un llamado (endpoint de uso exclusivo para Miembros del Tribunal), ya que se genera un cambio pendente a aprobar por CDP.
    """
    cambiarEstadoPostulanteLlamadoTribunal(
      data: CambiarEstadoPostulanteLlamadoInput!
    ): MessageResponse
    """
    Guardar los puntajes de un postulante en un llamado.
    """
    guardarPuntajesPostulanteEnLlamado(
      data: DataGrillaInput!
    ): MessageResponse
  }

  type Query {
    """
    Listar postulantes.
    """
    listarPostulantes: [PostulanteListItemOutput]
    """
    Obtener la info completa de un postulante en un llamado x.
    """
    infoPostulanteEnLlamado(
      llamadoId: Int!
      postulanteId: Int!
    ): PostulanteLlamadoFull
    """
    Listar postulantes en un llamado x.
    """
    getPostulantesByLlamadoId(
      llamadoId: Int!
    ): [PostulanteInLlamadoResumed]
  }

  type Subscription {
    postulanteCreated: PostulanteSubOutput
  }
`;

export default postulanteSchema;

import { gql } from 'apollo-server-express';

const llamadoSchema = gql`
  enum TipoMiembro {
    Titular
    Suplente
  }

  type LlamadoList {
    id: Int
    nombre: String
    estado: String
    ultimaModificacion: String
    ref: String
    cupos: Int
    cargo: Cargo
    postulantes: Int
    progreso: Float
  }

  input RequisitoCreate {
    index: Int
    nombre: String!
    puntaje: Int!
    excluyente: Boolean!
  }

  input SubetapaCreate {
    index: Int
    nombre: String!
    puntajeMaximo: Int!
    requisitos: [RequisitoCreate]!
    subtotal: Int
  }

  input EtapaCreate {
    index: Int
    nombre: String!
    plazoDiasMaximo: Int!
    puntajeMinimo: Int!
    subetapas: [SubetapaCreate]!
  }

  type Query {
    listarLlamados: [LlamadoList]
  }

  input LlamadoInfoCreate {
    nombre: String!
    referencia: String!
    cantidadHoras: Int!
    cupos: Int!
    cargo: Int!
    itr: ITR!
    solicitante: Int!
    enviarEmailTodos: Boolean!
  }

  input TribunalCreate {
    id: Int!
    type: TipoMiembro!
    order: Int!
  }

  input CreateLlamadoInput {
    tribunales: [TribunalCreate]!
    postulantes: [Int]!
    llamadoInfo: LlamadoInfoCreate!
    etapas: [EtapaCreate]!
    categorias: [Int]!
  }

  type LlamadoResponseOk {
    ok: Boolean
    message: String
  }

  type EstadoLlamado {
    id: Int
    nombre: String
  }

  type Cambio {
    id: Int
    cambio: Boolean
    nombre: String
  }

  type HistorialLlamado {
    id: Int
    descripcion: String
    usuario: UserList
    createdAt: String
    cambio: Cambio
  }

  input LlamadoChangeCambioInput {
    historialItemId: Int!
    cambioId: Int!
    accept: Boolean!
  }

  type Archivo {
    id: Int
    nombre: String
    url: String
    extension: String
    tipoArchivo: TipoArchivoItemOutput
  }

  type TribunalLlamado {
    usuario: UserList
    id: Int
    orden: Int
    motivoRenuncia: String
    tipoMiembro: TipoMiembro
  }

  type LlamadoPostulante {
    postulante: PostulanteListItemOutput
  }

  input AddFileLlamadoInput {
    nombre: String!
    url: String!
    extension: String!
    tipoArchivo: Int!
    llamadoId: Int!
  }

  type FullLlamadoInfo {
    id: Int
    nombre: String
    referencia: String
    cantidadHoras: Int
    cupos: Int
    enviarEmailTodos: Boolean
    solicitante: UserList
    itr: ITR
    etapaUpdated: String
    estadoActual: EstadoLlamado
    miembrosTribunal: [TribunalLlamado]
    cargo: Cargo
    postulantes: [LlamadoPostulante]
    categorias: [CategoriaListItemOutput]
    historiales: [HistorialLlamado]
    archivos: [Archivo]
    archivosFirma: [Archivo]
    etapas: [EtapaList]
    etapaActual: EtapaList
  }

  input CambiarEstadoLlamadoInput {
    llamadoId: Int!
    etapa: Int!
    estado: String!
  }

  type Query {
    getLlamadoById(llamadoId: Int): FullLlamadoInfo
  }

  type Mutation {
    crearLlamado(info: CreateLlamadoInput): LlamadoResponseOk
    deshabilitarLlamados(llamados: [Int]): LlamadoResponseOk
    cambiarEstadoLlamado(
      info: CambiarEstadoLlamadoInput
    ): LlamadoResponseOk
    
    cambiarCambioLlamado(info: LlamadoChangeCambioInput): LlamadoResponseOk
  }

  type Subscription {
    llamadoCreado: LlamadoList
  }
`;

export default llamadoSchema;

import { gql } from 'apollo-server-express';

const llamadoSchema = gql`
  scalar Date
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
    itr: String
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
    llamado: LlamadoList
    cambio: Cambio
  }

  input LlamadoChangeCambioInput {
    historialItemId: Int!
    cambioId: Int!
    accept: Boolean!
  }

  type EtapaListResumed {
    id: Int!
    nombre: String!
    plazoDias: Int
    puntajeMin: Int
    total: Int
    createdAt: Date!
    updatedAt: Date!
  }

  type Archivo {
    id: Int
    nombre: String
    url: String
    extension: String
    tipoArchivo: TipoArchivoItemOutput
  }

  type Firmas {
    usuario: UserList
    firmado: Boolean
  }

  type ArchivoFirma {
    urlOriginal: String
    id: Int
    nombre: String
    url: String
    extension: String
    tipoArchivoFirma: String
    firmas: [Firmas]
  }

  type TribunalLlamado {
    usuario: UserList
    id: Int
    orden: Int
    motivoRenuncia: String
    tipoMiembro: TipoMiembro
  }

  type PostulanteEstadoActual {
    id: Int
    nombre: String
  }

  type LlamadoPostulante {
    postulante: PostulanteListItemOutput
    estadoActual: PostulanteEstadoActual
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
    archivosFirma: [ArchivoFirma]
    etapas: [EtapaList]
    etapaActual: EtapaList
  }

  input CambiarEstadoLlamadoInput {
    llamadoId: Int!
    etapa: Int
    estado: String
  }

  input ListarLlamadoInputQuery {
    selectedCategorias: [Int]
    selectedCargos: [Int]
    selectedPostulantes: [Int]
    selectedUsuarios: [Int]
    selectedEstados: [String]
    selectedITRs: [String]
  }

  type RequisitoType {
    id: Int
    nombre: String!
    puntajeSugerido: Float!
    puntaje: Float!
    excluyente: Boolean!
  }

  type SubEtapaGrilla {
    id: Int
    nombre: String!
    subtotal: Float!
    puntajeMaximo: Float!
    requisitos: [RequisitoType!]!
  }

  type EtapaGrilla {
    id: Int
    nombre: String!
    plazoDias: Int!
    total: Float!
    puntajeMin: Float!
    currentEtapa: Float!
    cantEtapas: Float!
    subetapas: [SubEtapaGrilla!]!
  }

  type CurrentEtapaData {
    currentEtapa: EtapaGrilla!
    allEtapas: [EtapaGrilla]!
  }

  input CambiarTribunalInput {
    id: Int
    tipoMiembro: TipoMiembro
    orden: Int
  }

  type Query {
    getLlamadoById(llamadoId: Int): FullLlamadoInfo
    """
    Obtener data de la etapa en la que se encuentra un postulante en un llamado x.
    """
    getEtapaActualPostInLlamado(
      llamadoId: Int!
      postulanteId: Int!
    ): CurrentEtapaData
  }

  input RenunciarLlamadoInput {
    llamadoId: Int!
    userId: Int!
    motivoRenuncia: String!
  }

  input AvanzarEtapaInput {
    llamadoId: Int!
    postulanteId: Int!
    currentEtapa: Int!
  }

  input AgregarPostulanteALlamadoInput {
    llamadoId: Int!
    postulanteId: Int!
  }

  type Mutation {
    crearLlamado(info: CreateLlamadoInput): LlamadoResponseOk
    deshabilitarLlamados(llamados: [Int]): LlamadoResponseOk
    cambiarEstadoLlamado(
      info: CambiarEstadoLlamadoInput
    ): LlamadoResponseOk
    cambiarCambioLlamado(
      info: LlamadoChangeCambioInput
    ): LlamadoResponseOk
    renunciarLlamado(info: RenunciarLlamadoInput): LlamadoResponseOk
    avanzarEtapaPostulanteInLlamado(
      data: AvanzarEtapaInput
    ): MessageResponse
    agregarPostulanteALlamadoExistente(
      data: AgregarPostulanteALlamadoInput
    ): MessageResponse

    cambiarMiembroTribunal(data: CambiarTribunalInput): MessageResponse
  }

  type RequisitoPostulanteList {
    puntaje: Int
    requisitoId: Int
  }

  type CantidadCargo {
    nombre: String
    cantidad: Int
  }

  type EstadisticasGet {
    llamadosEnProceso: Int
    llamadosFinalizados: Int
    nuevosPostulantes: Int
    llamadosRecientes: [LlamadoList]
    postulantesRecientes: [PostulanteListItemOutput]
    cantidadCargos: [CantidadCargo]
  }

  type PostulantePuntaje {
    postulanteId: Int
    requisitos: [RequisitoPostulanteList]
  }

  type PaginationLlamados {
    llamados: [LlamadoList]
    totalPages: Int
  }

  input PaginationInput {
    offset: Int
    currentPage: Int
  }

  type Query {
    listarLlamados(filters: ListarLlamadoInputQuery): [LlamadoList]
    listarLlamadosByUser(userId: Int!): [LlamadoList]
    listarLlamadosPaged(filters: ListarLlamadoInputQuery, pagination: PaginationInput): PaginationLlamados
    listarPuntajesPostulantes(llamadoId: Int): [PostulantePuntaje]
    listarEstadisticas(itr: String, meses: String): EstadisticasGet
    listarAllHistoriales: [HistorialLlamado]
  }

  type Subscription {
    llamadoCreado: LlamadoList
  }
`;

export default llamadoSchema;

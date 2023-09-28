import { gql } from "apollo-server-express";

const llamadoSchema = gql`
     enum TipoMiembro {
        Titular
        Suplente
    }

    type LlamadoList {
        id: Int,
        nombre: String
        estado: String
        ultimaModificacion: String,
        ref: String
        cupos: Int
        cargo: Cargo,
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
        id: Int!,
        type: TipoMiembro!
        order: Int!
    }

    input CreateLlamadoInput {
        tribunales: [TribunalCreate]!
        postulantes: [Int]!
        llamadoInfo: LlamadoInfoCreate!
        etapas: [EtapaCreate]!
    }

    type LlamadoCreateResponse {
        ok: Boolean
        message: String
    }

    type Mutation {
        crearLlamado(info: CreateLlamadoInput): LlamadoCreateResponse
    }

    type Subscription {
        llamadoCreado: LlamadoList
    }

`;


export default llamadoSchema;
import { gql } from "apollo-server-express";

const llamadoSchema = gql`
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
        nombre: String!
        puntaje: Int!
        excluyente: Boolean!
    }

    input SubetapaCreate {
        nombre: String!
        puntajeMaximo: Int!
        requisitos: [RequisitoCreate]!
    }

    input EtapaCreate {
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

    input CreateLlamadoInput {
        tribunales: [Int]!
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
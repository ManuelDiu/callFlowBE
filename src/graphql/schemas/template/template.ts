import { gql } from 'apollo-server-express';

const templateSchema = gql`
  type TemplateList {
    id: Int
    nombre: String
    cargo: Cargo
    etapas: Int
    color: String
    activo: Boolean
  }

  type Query {
    listarTemplates: [TemplateList]
  }

  type RequisitoList {
    nombre: String
    puntajeSugerido: Int
    excluyente: Boolean
  }

  type SubEtapaList {
    nombre: String
    puntajeTotal: Int
    puntajeMaximo: Int
    requisitos: [RequisitoList]
  }

  type EtapaList {
    nombre: String
    plazoDias: Int
    puntajeMin: Int
    total: Int
    subetapas: [SubEtapaList]
  }

  type TemplateInfo {
    id: Int
    nombre: String
    cargo: Cargo
    etapa: [EtapaList]
    color: String
    activo: Boolean
  }

  input CreateTemplateInput {
    etapas: [EtapaCreate]!
    color: String!
    cargo: Int!
    nombre: String!
  }

  input CreateTemplateInput {
    etapas: [EtapaCreate]!
    color: String!
    cargo: Int!
    nombre: String!
  }

  type TemplateResponseOk {
    ok: Boolean
    message: String
  }

  type Mutation {
    crearTemplate(info: CreateTemplateInput): TemplateResponseOk
    deshabilitarTemplates(templates: [Int]): TemplateResponseOk
    getTemplateById(templateId: Int!): TemplateInfo
  }

  type Query {
    listarTemplates: [TemplateList]
  }

  type Subscription {
    templateCreado: TemplateList
  }
`;

export default templateSchema;

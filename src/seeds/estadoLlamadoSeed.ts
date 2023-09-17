import { EstadoLlamadoEnum } from "../enums/EstadoLlamadoEnum";

export const estadoLlamadoSeed = [
    {
        id: 1,
        nombre: EstadoLlamadoEnum.creado,
    },
    {
        id: 2,
        nombre: EstadoLlamadoEnum.enRelevamiento,
    },
    {
        id: 3,
        nombre: EstadoLlamadoEnum.listoParaEstudioMerito,
    },
    {
        id: 4,
        nombre: EstadoLlamadoEnum.enEstudioMerito,
    },
    {
        id: 5,
        nombre: EstadoLlamadoEnum.listoParaEntrevistas,
    },
    {
        id: 6,
        nombre: EstadoLlamadoEnum.enEntrevias,
    },
    {
        id: 7,
        nombre: EstadoLlamadoEnum.listoParaPsicotecnico,
    },
    {
        id: 8,
        nombre: EstadoLlamadoEnum.enPsicotecnico,
    },
    {
        id: 9,
        nombre: EstadoLlamadoEnum.listoParaFirmarGrilla,
    },
    {
        id: 10,
        nombre: EstadoLlamadoEnum.enProcesoDeFrimaGrilla,
    },
    {
        id: 11,
        nombre: EstadoLlamadoEnum.listoParaFirmarActaFinal,
    },
    {
        id: 12,
        nombre: EstadoLlamadoEnum.enProcesoDeFrimaActaFinal,
    },
    {
        id: 13,
        nombre: EstadoLlamadoEnum.finalizado,
    },
    {
        id: 14,
        nombre: EstadoLlamadoEnum.eliminado,
    }
]
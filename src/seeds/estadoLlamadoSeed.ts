import { EstadoLlamadoEnum } from "../enums/EstadoLlamadoEnum";

export const estadoLlamadoSeed = [
    {
        id: 1,
        nombre: EstadoLlamadoEnum.publicacionPendiente,
    },
    {
        id: 2,
        nombre: EstadoLlamadoEnum.abierto,
    },
    {
        id: 3,
        nombre: EstadoLlamadoEnum.bajarCvs,
    },
    {
        id: 4,
        nombre: EstadoLlamadoEnum.conformacionTribunal,
    },
    {
        id: 5,
        nombre: EstadoLlamadoEnum.cvsCompartidos,
    },
    {
        id: 6,
        nombre: EstadoLlamadoEnum.entrevistas,
    },
    {
        id: 7,
        nombre: EstadoLlamadoEnum.psicotecnicoSolicitado,
    },
    {
        id: 8,
        nombre: EstadoLlamadoEnum.psicotecnicoCompartido,
    },
    {
        id: 9,
        nombre: EstadoLlamadoEnum.pendienteHacerActa,
    },
    {
        id: 10,
        nombre: EstadoLlamadoEnum.pendienteHacerFirma,
    },
    {
        id: 11,
        nombre: EstadoLlamadoEnum.pendieteSubidaCDC,
    },
    {
        id: 12,
        nombre: EstadoLlamadoEnum.pendienteSubidaCDACGA,
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
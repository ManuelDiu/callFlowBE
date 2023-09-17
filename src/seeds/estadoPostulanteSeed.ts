import { EstadoPostulanteEnum } from "../enums/EstadoPostulanteEnum";

export const estadoPostulanteSeed = [
    {
        id: 1,
        nombre: EstadoPostulanteEnum.cumpleRequisito
    },
    {
        id: 2,
        nombre: EstadoPostulanteEnum.noCumpleRequisito
    },
    {
        id: 3,
        nombre: EstadoPostulanteEnum.enDua
    }
]
import { EstadoPosibleLlamado } from 'entities/estadoLlamado/estadoLlamado.entity';
import { EstadoLlamadoEnum } from 'enums/EstadoLlamadoEnum';

const ORDER_LLAMADO_STATUS = [
  EstadoLlamadoEnum.creado,
  EstadoLlamadoEnum.enRelevamiento,
  EstadoLlamadoEnum.listoParaEstudioMerito,
  EstadoLlamadoEnum.enEstudioMerito,
  EstadoLlamadoEnum.listoParaEntrevistas,
  EstadoLlamadoEnum.enEntrevias,
  EstadoLlamadoEnum.listoParaPsicotecnico,
  EstadoLlamadoEnum.enPsicotecnico,
  EstadoLlamadoEnum.listoParaFirmarGrilla,
  EstadoLlamadoEnum.enProcesoDeFrimaGrilla,
  EstadoLlamadoEnum.listoParaFirmarActaFinal,
  EstadoLlamadoEnum.enProcesoDeFrimaActaFinal,
  EstadoLlamadoEnum.finalizado,
];

const valueOfEachItem = 100 / ORDER_LLAMADO_STATUS?.length;

export const getProgressOfLlamado = (estado: EstadoPosibleLlamado): number => {
    const currentIndex = ORDER_LLAMADO_STATUS?.findIndex((item) => item === estado?.nombre);
    if (currentIndex < 0) {
        return 0;
    } else {
        return valueOfEachItem * (currentIndex + 1);
    }
};

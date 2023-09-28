import { EstadoPosibleLlamado } from 'entities/estadoLlamado/estadoLlamado.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { EstadoLlamadoEnum } from 'enums/EstadoLlamadoEnum';
import { LlamadoList } from 'types/llamados';

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

export const getProgressOfLlamado = (
  estado: EstadoPosibleLlamado,
): number => {
  const currentIndex = ORDER_LLAMADO_STATUS?.findIndex(
    (item) => item === estado?.nombre,
  );
  if (currentIndex < 0) {
    return 0;
  } else {
    return valueOfEachItem * (currentIndex + 1);
  }
};

export const formatLlamadoToList = (llamado: Llamado) => {
  return {
    id: llamado?.id,
    nombre: llamado?.nombre,
    estado: llamado?.estadoActual?.nombre,
    ultimaModificacion: llamado?.updatedAt?.toString(),
    ref: llamado?.referencia,
    cupos: llamado?.cupos,
    cargo: llamado?.cargo,
    postulantes: llamado?.postulantes?.length,
    progreso: getProgressOfLlamado(llamado?.estadoActual),
  } as LlamadoList;
};

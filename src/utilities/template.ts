import { Template } from 'entities/template/template.entity';
import { EtapaGrilla, RequisitoType } from 'types/grillaLlamado';
import { TemplateList } from 'types/template';

export const formatTemplateToList = (template: Template) => {
  
  return {
    id: template?.id,
    nombre: template?.nombre,
    color: template?.color,
    cargo: template?.cargo,
    etapas: template?.etapa?.map((currEtapa, index) => {
      return {
        id: currEtapa.id,
        nombre: currEtapa.nombre,
        puntajeMin: currEtapa.puntajeMin,
        plazoDias: currEtapa.plazoDias,
        total: 0,
        currentEtapa: Number(index + 1),
        cantEtapas: Number(template?.etapa?.length),
        subetapas: currEtapa?.subetapas?.map((currSub) => {
          return {
            id: currSub.id,
            nombre: currSub.nombre,
            puntajeMaximo: currSub?.puntajeMaximo,
            subtotal: 0,
            requisitos: currSub?.requisitos?.map(
              (currReq): RequisitoType => {
                return {
                  id: currReq.id,
                  nombre: currReq.nombre,
                  excluyente: currReq.excluyente,
                  puntajeSugerido: currReq.puntajeSugerido,
                  puntaje: currReq?.puntajeSugerido,
                };
              },
            ),
          };
        }),
      }
    }),
    activo: template?.activo,
  } as TemplateList;
};

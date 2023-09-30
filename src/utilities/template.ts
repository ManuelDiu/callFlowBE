import { Template } from 'entities/template/template.entity';
import { TemplateList } from 'types/template';

export const formatTemplateToList = (template: Template) => {
  return {
    id: template?.id,
    nombre: template?.nombre,
    color: template?.color,
    cargo: template?.cargo,
    etapas: template?.etapa?.length,
    activo: template?.activo,
  } as TemplateList;
};

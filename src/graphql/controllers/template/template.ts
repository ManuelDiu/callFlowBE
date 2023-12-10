import {
  TemplateCreateInput,
  TemplateCreateResponse,
  TemplateInfo,
  TemplateList,
} from 'types/template';
import { checkAuth } from 'utilities/checkAuth';
import { Roles as EnumRoles } from 'enums/Roles';
import { getRepository } from 'typeorm';
import { Template } from 'entities/template/template.entity';
import { Cargo } from 'entities/cargo/cargo.entity';
import { Etapa } from 'entities/etapa/etapa.entity';
import { Subetapa } from 'entities/subetapa/subetapa.entity';
import { Requisito } from 'entities/requisito/requisito.entity';
import { PubSub } from 'graphql-subscriptions';
import { formatTemplateToList } from 'utilities/template';

const templateSub = new PubSub();

export const templateController = {
  Mutation: {
    crearTemplate: async (
      _: any,
      { info }: { info: TemplateCreateInput },
      context: any,
    ): Promise<TemplateCreateResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const { etapas, nombre, color, cargo } = info;
        const existsTemplateWithSameName = await getRepository(
          Template,
        ).findOne({
          nombre: nombre,
        });
        if (existsTemplateWithSameName) {
          throw new Error('Ya existe un template con este nombre');
        }
        const selectedCargo = await getRepository(Cargo).findOne({
          id: cargo,
        });
        if (!selectedCargo) {
          throw new Error('Cargo invalido');
        }
        const template = new Template();
        template.cargo = selectedCargo;
        template.nombre = nombre;
        template.color = color;

        // creo el llamado
        const newTemplate = await getRepository(Template).save(
          template,
        );

        const createEtapas = Promise.all(
          etapas?.map(async (etapa) => {
            const newEtapa = new Etapa();
            newEtapa.plazoDias = etapa?.plazoDiasMaximo;
            newEtapa.nombre = etapa?.nombre;
            newEtapa.postulantes = [];
            newEtapa.llamado = null;
            newEtapa.template = newTemplate;
            newEtapa.total = 100;
            newEtapa.puntajeMin = etapa?.puntajeMinimo;
            const createdEtapa = await getRepository(Etapa).save(
              newEtapa,
            );
            const createSubEtapas = Promise.all(
              etapa?.subetapas?.map(async (subetapa) => {
                const newSubEtapa = new Subetapa();
                newSubEtapa.nombre = subetapa?.nombre;
                newSubEtapa.puntajeMaximo = subetapa?.puntajeMaximo;
                newSubEtapa.etapa = createdEtapa;
                newSubEtapa.puntajeTotal = 0;
                const createdSubEtapa = await getRepository(
                  Subetapa,
                ).save(newSubEtapa);
                const crearRequisitos = Promise.all(
                  subetapa?.requisitos?.map(async (requisito) => {
                    const newRequisito = new Requisito();
                    newRequisito.nombre = requisito.nombre;
                    newRequisito.excluyente = requisito?.excluyente;
                    newRequisito.puntajeSugerido = requisito?.puntaje;
                    newRequisito.subetapa = createdSubEtapa;
                    await getRepository(Requisito).save(newRequisito);
                  }),
                );
                await crearRequisitos;
              }),
            );
            await createSubEtapas;
          }),
        );

        await createEtapas;

        const loadedTemplateInfo = await getRepository(
          Template,
        ).findOne(
          {
            id: newTemplate?.id,
          },
          {
            relations: [
              'cargo',
              'etapa',
              'etapa.subetapas',
              'etapa.subetapas.requisitos',
              'etapa.subetapas.requisitos.allPuntajes',
            ],
          },
        );
        templateSub.publish('List_Template', {
          templateCreado: formatTemplateToList(loadedTemplateInfo),
        });

        return {
          ok: true,
          message: 'Template creado correctamente',
        };
      } catch (error) {
        console.log('error is', error);
        if (error?.message?.includes('Duplicate entry')) {
          return {
            ok: false,
            message: 'Ya existe un template con este nombre',
          };
        }
        return {
          ok: false,
          message: error?.message,
        };
      }
    },
    deshabilitarTemplates: async (
      _: any,
      { templates }: { templates: number[] },
      context: any,
    ): Promise<TemplateCreateResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);

        const disabledLlamados = Promise.all(
          templates?.map(async (templateId: number) => {
            const template = await getRepository(Template).findOne({
              id: templateId,
            });
            template.activo = false;
            await getRepository(Template).save(template);

            const templateInfo = formatTemplateToList(template);
            templateSub.publish('List_Template', {
              templateCreado: templateInfo,
            });
          }),
        );
        await disabledLlamados;

        return {
          ok: true,
          message: 'Templates deshabilitados correctamente',
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || 'Error al deshabilitar llamados',
        };
      }
    },
    getTemplateById: async (
      _: any,
      { templateId }: { templateId: number },
      context: any,
    ): Promise<TemplateInfo> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const templateInfo = await getRepository(Template).findOne(
          { id: templateId },
          {
            relations: [
              'etapa',
              'cargo',
              'etapa.subetapas',
              'etapa.subetapas.requisitos',
            ],
          },
        );
        if (!templateInfo) {
          throw new Error(
            'Error al cargar la informacion del template',
          );
        }

        console.log('templateInfo is', templateInfo);
        const newEtapas = [...templateInfo?.etapa]?.sort(
          (itemA: any, itemB: any) => {
            if (itemA?.createdAt > itemB?.createdAt) {
              return 1;
            } else {
              return -1;
            }
          },
        );

        return {
          ...templateInfo,
          etapa: newEtapas,
        } as any;
      } catch (error) {
        return null;
      }
    },
  },
  Query: {
    listarTemplates: async (
      _: any,
      __: any,
      context: any,
    ): Promise<TemplateList[]> => {
      try {
        await checkAuth(context, [
          EnumRoles.admin,
          EnumRoles.tribunal,
          EnumRoles.cordinador,
        ]);
        const templates = await getRepository(Template).find({
          relations: [
            'cargo',
            'etapa',
            'etapa.subetapas',
            'etapa.subetapas.requisitos',
            'etapa.subetapas.requisitos.allPuntajes',
          ],
        });
        if (!templates || templates?.length === 0) {
          return [];
        }
        return templates?.map((template) => {
          return formatTemplateToList(template);
        });
      } catch (err) {
        throw new Error(err?.message || 'Error al listar templates');
      }
    },
  },
  Subscription: {
    templateCreado: {
      subscribe: () => templateSub.asyncIterator(['List_Template']),
    },
  },
};

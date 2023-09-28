import { Llamado } from 'entities/llamado/llamado.entity';
import { Roles } from 'enums/Roles';
import { isAdmin } from 'middlewares/permission-handler.middleware';
import { getRepository } from 'typeorm';
import {
  LLamaodCreateInput,
  LlamadoCreateResponse,
  LlamadoList,
} from 'types/llamados';
import { checkAuth } from 'utilities/checkAuth';
import { getProgressOfLlamado } from 'utilities/llamado';

const llamadoController: any = {
  Mutation: {
    prueba: async (_: any, __: any, context: any) => {
      await checkAuth(context, [Roles.cordinador, Roles.admin]);

      return 'solo llega si el usuario tiene rol cordinador o admin';
    },
    crearLlamado: async (
      _: any,
      { info }: { info: LLamaodCreateInput },
      context: any,
    ): Promise<LlamadoCreateResponse> => {
      try {
        const { etapas, llamadoInfo, tribunales, postulantes } = info;
        const existsLlamadoWithSameName = await getRepository(Llamado).findOne({
          nombre: llamadoInfo?.nombre,
        })
        if (existsLlamadoWithSameName) {
          throw new Error("Ya existe un llamado con este nombre");
        }

        return {
          ok: false,
          message: '',
        };
      } catch (error) {
        throw new Error(
          error?.message ||
            'Error al crear llamado, comuníquese con soporte',
        );
      }
    },
  },
  Query: {
    listarLlamados: async (
      _: any,
      __: any,
      context: any,
    ): Promise<LlamadoList[]> => {
      await checkAuth(context, [
        Roles.admin,
        Roles.tribunal,
        Roles.cordinador,
      ]);
      const llamados = await getRepository(Llamado).find({
        relations: ['estadoActual', 'cargo', 'postulantes'],
      });

      const allLlamadosFormtted =
        llamados?.map((llamado) => {
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
        }) || [];

      return allLlamadosFormtted;
    },
  },
};

export default llamadoController;

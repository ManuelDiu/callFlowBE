import { Disponibilidad } from 'entities/disponibilidad/disponibilidad.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { Roles } from 'enums/Roles';
import moment from 'moment';
import { getRepository } from 'typeorm';
import { DisponibilidadCreate } from 'types/disponibilidad';
import { checkAuth, getLoggedUserInfo } from 'utilities/checkAuth';

export const disponibilidadController = {
  Query: {
    listarDisponibilidad: async (
      _: any,
      { llamadoId }: { llamadoId: number },
      context: any,
    ): Promise<any[]> => {
      try {
        await checkAuth(context, [
          Roles.admin,
          Roles.cordinador,
          Roles.tribunal,
        ]);
        const llamado = await getRepository(Llamado).findOne(
          {
            id: llamadoId,
          },
          {
            relations: ['disponibilidad'],
          },
        );
        if (!llamado) {
          throw new Error('Llamado invalido');
        }
        return llamado?.disponibilidad?.map((item) => {
          return {
            ...item,
            fecha: moment(item?.fecha).format('DD/MM/YYYY'),
          };
        });
      } catch (error) {
        console.log('error is', error);
        return [];
      }
    },
  },
  Mutation: {
    crearDisponibilidad: async (
      _: any,
      { data }: { data: DisponibilidadCreate },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const llamado = await getRepository(Llamado).findOne(
          {
            id: data.llamadoId,
          },
          {
            relations: ['miembrosTribunal', 'miembrosTribunal.usuario'],
          },
        );
        if (!llamado) {
          throw new Error('El llamado no existe');
        }
        const hasPermissions = llamado.miembrosTribunal?.find(
          (item) => item?.usuario?.id === loggedUserInfo?.id,
        );
        if (
          hasPermissions === null ||
          typeof hasPermissions === 'undefined'
        ) {
          throw new Error('Permisos insuficientes');
        }
        const disponibilidad = new Disponibilidad();
        disponibilidad.fecha = moment(data.fecha).toDate();
        disponibilidad.horaMax = data.horaMax;
        disponibilidad.horaMin = data.horaMin;
        disponibilidad.llamado = llamado;
        await getRepository(Disponibilidad).save(disponibilidad);
        return {
          ok: true,
          message: 'Disponibilidad creada correctamente ',
        };
      } catch (error) {
        return {
          ok: true,
          message: error?.message || 'Erro al crear disponibilidad ',
        };
      }
    },
    borrarDisponibilidad: async (
      _: any,
      { disponibilidadId }: { disponibilidadId: number },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const disponibilidad = await getRepository(
          Disponibilidad,
        ).findOne(
          {
            id: disponibilidadId,
          },
          {
            relations: ['llamado'],
          },
        );
        if (!disponibilidad) {
          throw new Error('Disponibilidad invalida');
        }

        const llamado = await getRepository(Llamado).findOne(
          {
            id: disponibilidad.llamado?.id,
          },
          {
            relations: ['miembrosTribunal', 'miembrosTribunal.usuario'],
          },
        );
        if (!llamado) {
          throw new Error('El llamado no existe');
        }
        const hasPermissions = llamado.miembrosTribunal?.find(
          (item) => item?.usuario?.id === loggedUserInfo?.id,
        );
        if (
          hasPermissions === null ||
          typeof hasPermissions === 'undefined'
        ) {
          throw new Error('Permisos insuficientes');
        }
        await getRepository(Disponibilidad).remove(disponibilidad);
        return {
          ok: true,
          message: 'Disponibilidad borrada correctamente ',
        };
      } catch (error) {
        return {
          ok: true,
          message: error?.message || 'Erro al borrar disponibilidad ',
        };
      }
    },
  },
  Subscription: {},
};

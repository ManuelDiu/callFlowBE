import { Archivo } from 'entities/archivo/archivo.entity';
import { ArchivoFirma } from 'entities/archivofirma/archivofirma.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { TipoArchivo } from 'entities/tipoArchivo/tipoArchivo.entity';
import { Roles } from 'enums/Roles';
import { getRepository } from 'typeorm';
import {
  AddFileToLlamado,
  AddFileToLlamadoFirma,
} from 'types/llamados';
import { checkAuth } from 'utilities/checkAuth';

const archivoController = {
  Mutation: {
    deleteArchivo: async (
      _: any,
      { archivoId }: { archivoId: number },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.admin]);
        const archivo = await getRepository(Archivo).findOne({
          id: archivoId,
        });
        await getRepository(Archivo).remove(archivo);
        return {
          ok: true,
          message: 'Archivo eliminado correctamente',
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || 'Error al eliminar archivo',
        };
      }
    },
    addFileToLlamado: async (
      _: any,
      { info }: { info: AddFileToLlamado },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.admin]);
        const llamado = await getRepository(Llamado).findOne(
          { id: info?.llamadoId },
          { relations: ['archivos'] },
        );
        const fileType = await getRepository(TipoArchivo).findOne({
          id: info?.tipoArchivo,
        });
        if (!fileType || !llamado) {
          throw new Error('Error al cargar archivo al llamado');
        }
        const newArchivo = new Archivo();
        newArchivo.nombre = info?.nombre;
        newArchivo.extension = info?.extension;
        newArchivo.url = info?.url;
        newArchivo.llamado = llamado;
        newArchivo.tipoArchivo = fileType;
        await getRepository(Archivo).save(newArchivo);

        return {
          ok: true,
          message: 'Archivo cargado correctamente',
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || 'Error al agregar archivo',
        };
      }
    },

    addArchivoFirmaToLlamado: async (
      _: any,
      { info }: { info: AddFileToLlamadoFirma },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.admin, Roles.tribunal]);
        const llamado = await getRepository(Llamado).findOne(
          { id: info?.llamadoId },
          { relations: ['archivosFirma'] },
        );
        if (!llamado) {
          throw new Error('Llamado invalido');
        }
        const newArchivo = new ArchivoFirma();
        const existsWithThisSlug = await getRepository(
          ArchivoFirma,
        ).findOne({
          llamado: llamado,
          nombre: info?.nombre,
        });
        if (existsWithThisSlug) {
          newArchivo.urlOriginal = existsWithThisSlug?.urlOriginal;
          await getRepository(ArchivoFirma).delete(existsWithThisSlug);
        } else {
          newArchivo.urlOriginal = info?.url;
        }
        newArchivo.nombre = info?.nombre;
        newArchivo.extension = info?.extension;
        newArchivo.url = info?.url;
        newArchivo.llamado = llamado;
        await getRepository(ArchivoFirma).save(newArchivo);

        return {
          ok: true,
          message: 'Archivo cargado correctamente',
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || 'Error al agregar archivo',
        };
      }
    },
  },
  Query: {},
  Subscription: {},
};

export default archivoController;

import { Archivo } from 'entities/archivo/archivo.entity';
import { ArchivoFirma } from 'entities/archivofirma/archivofirma.entity';
import { FirmaEstado } from 'entities/firmaestado/firmaestado.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { PostulanteLlamado } from 'entities/postulanteLlamado/postulanteLlamado.entity';
import { TipoArchivo } from 'entities/tipoArchivo/tipoArchivo.entity';
import { Usuario } from 'entities/usuarios/usuarios.entity';
import { Roles } from 'enums/Roles';
import { notificationEmail } from 'mailTemplates/notificationEmail.template';
import { getRepository } from 'typeorm';
import {
  AddFileToLlamado,
  AddFileToLlamadoFirma,
  FirmarArchivoInput,
} from 'types/llamados';
import { AddFileToPostulante } from 'types/posstulante';
import { checkAuth, getLoggedUserInfo } from 'utilities/checkAuth';
import { generateHistorialItem } from 'utilities/llamado';
import { sendEmail } from 'utilities/mail';

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
        if (!archivo) {
          const archivoFirma = await getRepository(
            ArchivoFirma,
          ).findOne({
            id: archivoId,
          }, {
            relations: ['firmas'],
          });
          await Promise.all(archivoFirma?.firmas?.map(async (firma) => {
            await getRepository(FirmaEstado).remove(firma);
          }))

          await getRepository(ArchivoFirma).remove(archivoFirma);
          return {
            ok: true,
            message: 'Archivo eliminado correctamente',
          };
        } else {
          await getRepository(Archivo).remove(archivo);
        }
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
        const loggedUserInfo = await getLoggedUserInfo(context);
        const llamado = await getRepository(Llamado).findOne(
          { id: info?.llamadoId },
          {
            relations: [
              'archivosFirma',
              'miembrosTribunal',
              'miembrosTribunal.usuario',
            ],
          },
        );
        if (!llamado) {
          throw new Error('Llamado invalido');
        }
        const archivoExists = await getRepository

        const newArchivo = new ArchivoFirma();
        const existsWithThisSlug = await getRepository(
          ArchivoFirma,
        ).findOne({
          llamado: llamado,
          nombre: info?.nombre,
        });
        if (existsWithThisSlug) {
          throw new Error(`Error ,ya existe un archivo de tipo ${info?.nombre}, borralo y intentalo nuevamente`)
        }
        newArchivo.urlOriginal = info?.url;
        newArchivo.nombre = info?.nombre;
        newArchivo.extension = info?.extension;
        newArchivo.url = info?.url;
        newArchivo.llamado = llamado;
        await getRepository(ArchivoFirma).save(newArchivo);

        const text = `
        El usuario <span class="userColor">"${loggedUserInfo.name} ${loggedUserInfo?.lastName}"</span> agregó un archivo para firmar con nombre <span class="fileNameColor" >"${newArchivo.nombre}"</span> al llamado '${llamado?.nombre}'.
      `;

        const emailText = `
        El usuario <span class="userColor">"${loggedUserInfo.name} ${loggedUserInfo?.lastName}"</span> agregó un archivo para firmar con nombre <span class="fileNameColor" >"${newArchivo.nombre}"</span> al llamado '${llamado?.nombre}'.
      `;

        await generateHistorialItem({
          text: text,
          emailText: emailText,
          llamadoId: info?.llamadoId,
          userId: loggedUserInfo?.id,
        });

        await Promise.all(
          llamado?.miembrosTribunal?.map(async (miembroTribunal) => {
            if (miembroTribunal?.usuario?.email) {
              const emailText = `
              Querido miembro del tribunal <span class="userColor">"${miembroTribunal?.usuario?.name} ${miembroTribunal?.usuario?.lastName}"</span>, se agregó un archivo para firmar con nombre <span class="fileNameColor" >"${newArchivo.nombre}"</span> al llamado '${llamado?.nombre}, ingresas a la plataforma y firma el archivo para el progreso del llamado.'.
            `;
              const emailToSend = notificationEmail(
                process.env.APP_FRONTEND_URL,
                emailText,
              );
              await sendEmail(
                miembroTribunal?.usuario?.email,
                `Nuevo archivo para firmar - Llamado ${llamado?.nombre}`,
                emailToSend,
              );
            }
          }),
        );

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
    firmarArchivo: async (
      _: any,
      { info }: { info: FirmarArchivoInput },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const archivoFirma = await getRepository(ArchivoFirma).findOne(
          {
            id: info?.archivoFirmaId,
          },
          {
            relations: ['llamado'],
          },
        );
        if (!archivoFirma) {
          throw new Error('El archivo de firma es inválido');
        }
        archivoFirma.url = info?.url;

        const exitsFirmaEstado = await getRepository(
          FirmaEstado,
        ).findOne({
          usuario: loggedUserInfo,
          archivoFirma: archivoFirma,
        });

        if (exitsFirmaEstado) {
          exitsFirmaEstado.firmado = true;
          await getRepository(FirmaEstado).save(exitsFirmaEstado);
        } else {
          const firmaEstado = new FirmaEstado();
          firmaEstado.usuario = loggedUserInfo;
          firmaEstado.archivoFirma = archivoFirma;
          firmaEstado.firmado = true;
          await getRepository(FirmaEstado).save(firmaEstado);
        }

        await getRepository(ArchivoFirma).save(archivoFirma);

        const text = `
        El usuario <span class="userColor">"${loggedUserInfo.name} ${loggedUserInfo?.lastName}"</span> firmó el archivo <span class="fileNameColor" >"${archivoFirma?.nombre}"</span>'.
      `;

        const emailText = `
      El usuario <span class="userColor">"${loggedUserInfo.name} ${loggedUserInfo?.lastName}"</span> firmó el archivo <span class="fileNameColor" >"${archivoFirma?.nombre}"</span> del llamado '${archivoFirma?.llamado?.nombre}'.
    `;

        await generateHistorialItem({
          text: text,
          emailText: emailText,
          llamadoId: archivoFirma?.llamado?.id,
          userId: loggedUserInfo?.id,
        });

        return {
          ok: true,
          message: 'Archivo firmado correctamente',
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || 'Error al firmar archivo',
        };
      }
    },
    addFileToPostulante: async (
      _: any,
      { info }: { info: AddFileToPostulante },
      context: any,
    ) => {
      try {
        await checkAuth(context, [Roles.admin, Roles.tribunal]);
        const postulLlamado = await getRepository(
          PostulanteLlamado,
        ).findOne({
          where: {
            llamado: { id: info?.llamadoId },
            postulante: { id: info?.postulanteId },
          },
          relations: ['llamado', 'postulante', 'archivos'],
        });
        const fileType = await getRepository(TipoArchivo).findOne({
          id: info?.tipoArchivo,
        });
        if (!fileType || !postulLlamado) {
          throw new Error('Error al cargar archivo al postulante');
        }

        // TODO: tiene que ser parte del tribunal en el llamado.
        const usuarioSolicitante = await getRepository(Usuario).findOne(
          {
            where: {
              id: info?.solicitanteId,
            },
            relations: ['tribunales', 'tribunales.llamado'],
          },
        );

        if (!usuarioSolicitante) {
          throw new Error('Usuario solicitante no encontrado.');
        }

        const newArchivo = new Archivo();
        newArchivo.nombre = info?.nombre;
        newArchivo.extension = info?.extension;
        newArchivo.url = info?.url;
        newArchivo.postulante = postulLlamado;
        newArchivo.tipoArchivo = fileType;
        await getRepository(Archivo).save(newArchivo);

        // Genero Historial Item
        const text = `
        El usuario <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> agregó un archivo con nombre <span class="fileNameColor" >"${newArchivo.nombre}"</span> y de tipo archivo <span class="fileTypeColor" >"${newArchivo.tipoArchivo.nombre}"</span> al postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado.postulante.apellidos}"</span>.
      `;

        const emailText = `
        // El usuario <span class="userColor">"${usuarioSolicitante.name} ${usuarioSolicitante?.lastName}"</span> agregó un archivo con nombre <span class="fileNameColor" >"${newArchivo.nombre}"</span> y de tipo archivo <span class="fileTypeColor" >"${newArchivo.tipoArchivo.nombre}"</span> al postulante <span class="userColor" >"${postulLlamado.postulante.nombres} ${postulLlamado?.postulante?.apellidos}"</span> en el llamado "${postulLlamado?.llamado?.nombre}".
      `;

        await generateHistorialItem({
          text: text,
          emailText: emailText,
          llamadoId: info?.llamadoId,
          userId: usuarioSolicitante?.id,
        });
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

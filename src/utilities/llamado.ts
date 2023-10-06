import { EstadoPosibleLlamado } from 'entities/estadoLlamado/estadoLlamado.entity';
import { HistorialItem } from 'entities/historialitem/historialitem.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { Usuario } from 'entities/usuarios/usuarios.entity';
import { EstadoLlamadoEnum } from 'enums/EstadoLlamadoEnum';
import { Roles } from 'enums/Roles';
import { notificationEmail } from 'mailTemplates/notificationEmail.template';
import { getRepository } from 'typeorm';
import { LlamadoList } from 'types/llamados';
import { sendEmail } from './mail';

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

export const generateHistorialItem = async (
  text: string,
  llamadoId: number,
  userId: number,
) => {
  try {
    const llamado = await getRepository(Llamado).findOne({
      id: llamadoId
    }, {
      relations: ['creadoPor', 'miembrosTribunal']
    });
    const usuario = await getRepository(Usuario).findOne({
      id: userId,
    });
    if (!llamado || !usuario) {
      throw new Error('Informacion invalida');
    }

    const historialItem = new HistorialItem();
    historialItem.descripcion = text;
    historialItem.llamado = llamado;
    historialItem.usuario = usuario;
    await getRepository(HistorialItem).save(historialItem);

    const emailToSend = notificationEmail(
      process.env.APP_FRONTEND_URL,
      text,
    );

    // esto solo enviara email a los admin
    if (llamado?.enviarEmailTodos) {
      const usuarios =
        (await getRepository(Usuario)
          .createQueryBuilder('usuario')
          .innerJoin('usuario.roles', 'rol')
          .where('rol.nombre = :nombre', {
            nombre: Roles.admin,
          })
          .getMany()) || [];
      const sendEmailTodos = Promise.all(
        usuarios?.map(async (user) => {
          await sendEmail(
            user?.email,
            'Cambio Estado Llamado',
            emailToSend,
          );
        }),
      );
      await sendEmailTodos;
    } else {
      await sendEmail(
        llamado?.creadoPor.email,
        'Cambio Estado Llamado',
        emailToSend,
      );
      // enviar email a los miembros del tribunal titulares
    }
  } catch (error) {
    throw new Error(error);
  }
};

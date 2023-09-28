import { Cargo } from 'entities/cargo/cargo.entity';
import { EstadoPosibleLlamado } from 'entities/estadoLlamado/estadoLlamado.entity';
import { EstadoPostulante } from 'entities/estadoPostulante/estadoPostulante.entity';
import { Etapa } from 'entities/etapa/etapa.entity';
import { Llamado } from 'entities/llamado/llamado.entity';
import { Postulante } from 'entities/postulante/postulante.entity';
import { PostulanteLlamado } from 'entities/postulanteLlamado/postulanteLlamado.entity';
import { Requisito } from 'entities/requisito/requisito.entity';
import { Subetapa } from 'entities/subetapa/subetapa.entity';
import { TribunalLlamado } from 'entities/tribunalLlamado/tribunalLlamado.entity';
import { Usuario } from 'entities/usuarios/usuarios.entity';
import { EstadoLlamadoEnum } from 'enums/EstadoLlamadoEnum';
import { EstadoPostulanteEnum } from 'enums/EstadoPostulanteEnum';
import { ITR } from 'enums/ITR';
import { Roles as EnumRoles } from 'enums/Roles';
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
      await checkAuth(context, [EnumRoles.cordinador, EnumRoles.admin]);

      return 'solo llega si el usuario tiene rol cordinador o admin';
    },
    crearLlamado: async (
      _: any,
      { info }: { info: LLamaodCreateInput },
      context: any,
    ): Promise<LlamadoCreateResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const { etapas, llamadoInfo, tribunales, postulantes } = info;
        const existsLlamadoWithSameName = await getRepository(
          Llamado,
        ).findOne({
          nombre: llamadoInfo?.nombre,
        });
        if (existsLlamadoWithSameName) {
          throw new Error('Ya existe un llamado con este nombre');
        }
        const selectedCargo = await getRepository(Cargo).findOne({
          id: llamadoInfo?.cargo,
        });
        if (!selectedCargo) {
          throw new Error('Cargo invalido');
        }
        const solicitante = await getRepository(Usuario).findOne({
          id: llamadoInfo?.solicitante,
        });
        if (!solicitante) {
          throw new Error('Solicitante invalido');
        }
        const llamadoInitialState = await getRepository(
          EstadoPosibleLlamado,
        ).findOne({ nombre: EstadoLlamadoEnum.creado });

        const llamado = new Llamado();
        llamado.nombre = llamadoInfo.nombre;
        llamado.referencia = llamadoInfo?.referencia;
        llamado.cantidadHoras = llamadoInfo?.cantidadHoras;
        llamado.cupos = llamadoInfo?.cupos;
        llamado.enviarEmailTodos = llamadoInfo?.enviarEmailTodos;
        llamado.cargo = selectedCargo;
        llamado.solicitante = solicitante;
        if (llamadoInitialState) {
          llamado.estadoActual = llamadoInitialState;
        }
        llamado.itr = llamadoInfo?.itr as ITR;

        // creo el llamado
        const newLlamado = await getRepository(Llamado).save(llamado);

        // cero a los postulantes
        let createdPostulantesLlamado: PostulanteLlamado[] = [];
        const crearPostulantes = Promise.all(
          postulantes?.map(async (postulanteId) => {
            const postulante = await getRepository(Postulante).findOne({
              id: postulanteId,
            });
            // traigo el estado inicial
            const estadoInicial = await getRepository(
              EstadoPostulante,
            ).findOne({ nombre: EstadoPostulanteEnum.cumpleRequisito });
            if (postulante) {
              console.log("si, postulante")
              const postulante_llamado = new PostulanteLlamado();
              postulante_llamado.llamado = newLlamado;
              postulante_llamado.postulante = postulante;
              postulante_llamado.estadoActual = estadoInicial;
              createdPostulantesLlamado?.push(postulante_llamado);
              await getRepository(PostulanteLlamado).save(postulante_llamado);
            }
          }),
        );
        await crearPostulantes;

        const crearTribunales = Promise.all(
          tribunales?.map(async (tribunal) => {
            const usuario = await getRepository(Usuario).findOne(
              { id: tribunal?.id },
              {
                relations: ['roles'],
              },
            );
            if (usuario) {
              const hasTribunalRole = usuario?.roles?.find(
                (item) => item?.nombre === EnumRoles.tribunal,
              );
              if (hasTribunalRole) {
                const tribunal_llamado = new TribunalLlamado();
                tribunal_llamado.llamado = newLlamado;
                tribunal_llamado.usuario = usuario;
                tribunal_llamado.tipoMiembro = tribunal?.type;
                tribunal_llamado.orden = tribunal?.order;
                tribunal_llamado.motivoRenuncia = "";
                await getRepository(TribunalLlamado).save(tribunal_llamado)
              }
            }
          }),
        );
        await crearTribunales;

        const createEtapas = Promise.all(
          etapas?.map(async (etapa) => {
            const newEtapa = new Etapa();
            newEtapa.plazoDias = etapa?.plazoDiasMaximo;
            newEtapa.nombre = etapa?.nombre;
            newEtapa.postulantes = createdPostulantesLlamado;
            newEtapa.llamado = newLlamado;
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

        return {
          ok: true,
          message: 'Llamado creado correctamente',
        };
      } catch (error) {
        if (error?.message?.includes('Duplicate entry')) {
          return {
            ok: false,
            message:
              'Ya existe un llamado con este nombre o referencia',
          };
        }
        return {
          ok: false,
          message: error?.message,
        };
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
        EnumRoles.admin,
        EnumRoles.tribunal,
        EnumRoles.cordinador,
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

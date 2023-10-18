import { Archivo } from "entities/archivo/archivo.entity";
import { Cambio } from "entities/cambio/cambio.entity";
import { Cargo } from "entities/cargo/cargo.entity";
import { Categoria } from "entities/categoria/categoria.entity";
import { EstadoPosibleLlamado } from "entities/estadoLlamado/estadoLlamado.entity";
import { EstadoPostulante } from "entities/estadoPostulante/estadoPostulante.entity";
import { Etapa } from "entities/etapa/etapa.entity";
import { HistorialItem } from "entities/historialitem/historialitem.entity";
import { Llamado } from "entities/llamado/llamado.entity";
import { Postulante } from "entities/postulante/postulante.entity";
import { PostulanteLlamado } from "entities/postulanteLlamado/postulanteLlamado.entity";
import { Requisito } from "entities/requisito/requisito.entity";
import { Subetapa } from "entities/subetapa/subetapa.entity";
import { TipoArchivo } from "entities/tipoArchivo/tipoArchivo.entity";
import { TribunalLlamado } from "entities/tribunalLlamado/tribunalLlamado.entity";
import { Usuario } from "entities/usuarios/usuarios.entity";
import { EstadoLlamadoEnum } from "enums/EstadoLlamadoEnum";
import { EstadoPostulanteEnum } from "enums/EstadoPostulanteEnum";
import { ITR } from "enums/ITR";
import { Roles as EnumRoles } from "enums/Roles";
import { PubSub } from "graphql-subscriptions";
import { notificationEmail } from "mailTemplates/notificationEmail.template";
import { isAdmin } from "middlewares/permission-handler.middleware";
import { getRepository } from "typeorm";
import {
  AvanzarEtapaData,
  EtapaGrilla,
  RequisitoGrilla,
  RequisitoType,
  SubEtapaGrilla,
} from "types/grillaLlamado";
import {
  AddFileToLlamado,
  CambiarCambioLlamadoInput,
  CambiarEstadoLlamadoInput,
  LLamaodCreateInput,
  ListarLlamadoInputQuery,
  LlamadoCreateResponse,
  LlamadoList,
  RenunciarLlamadoInput,
} from "types/llamados";
import { MessageResponse } from "types/response";
import { RequisitoList } from "types/template";
import { checkAuth, getLoggedUserInfo } from "utilities/checkAuth";
import { formatLlamadoToList, generateHistorialItem } from "utilities/llamado";
import { MAIL_COLORS_UTILS } from "utilities/mail";
import { userIsAdmin } from "utilities/user";

const llamadoSub = new PubSub();

const llamadoController: any = {
  Mutation: {
    prueba: async (_: any, __: any, context: any) => {
      await checkAuth(context, [EnumRoles.cordinador, EnumRoles.admin]);

      return "solo llega si el usuario tiene rol cordinador o admin";
    },
    crearLlamado: async (
      _: any,
      { info }: { info: LLamaodCreateInput },
      context: any
    ): Promise<LlamadoCreateResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const loggedUserInfo = await getLoggedUserInfo(context);

        const {
          etapas,
          llamadoInfo,
          tribunales,
          postulantes,
          categorias,
        } = info;
        const existsLlamadoWithSameName = await getRepository(Llamado).findOne({
          nombre: llamadoInfo?.nombre,
        });
        if (existsLlamadoWithSameName) {
          throw new Error("Ya existe un llamado con este nombre");
        }
        const selectedCargo = await getRepository(Cargo).findOne({
          id: llamadoInfo?.cargo,
        });
        if (!selectedCargo) {
          throw new Error("Cargo invalido");
        }
        const solicitante = await getRepository(Usuario).findOne({
          id: llamadoInfo?.solicitante,
        });
        if (!solicitante) {
          throw new Error("Solicitante invalido");
        }
        const llamadoInitialState = await getRepository(
          EstadoPosibleLlamado
        ).findOne({ nombre: EstadoLlamadoEnum.creado });

        const llamado = new Llamado();
        llamado.nombre = llamadoInfo.nombre;
        llamado.referencia = llamadoInfo?.referencia;
        llamado.cantidadHoras = llamadoInfo?.cantidadHoras;
        llamado.cupos = llamadoInfo?.cupos;
        llamado.enviarEmailTodos = llamadoInfo?.enviarEmailTodos;
        llamado.cargo = selectedCargo;
        llamado.solicitante = solicitante;
        llamado.creadoPor = loggedUserInfo;
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
              EstadoPostulante
            ).findOne({ nombre: EstadoPostulanteEnum.cumpleRequisito });
            if (postulante) {
              const postulante_llamado = new PostulanteLlamado();
              postulante_llamado.llamado = newLlamado;
              postulante_llamado.postulante = postulante;
              postulante_llamado.estadoActual = estadoInicial;
              createdPostulantesLlamado?.push(postulante_llamado);
              await getRepository(PostulanteLlamado).save(postulante_llamado);
            }
          })
        );
        await crearPostulantes;

        const crearTribunales = Promise.all(
          tribunales?.map(async (tribunal) => {
            const usuario = await getRepository(Usuario).findOne(
              { id: tribunal?.id },
              {
                relations: ["roles"],
              }
            );
            if (usuario) {
              const hasTribunalRole = usuario?.roles?.find(
                (item) => item?.nombre === EnumRoles.tribunal
              );
              if (hasTribunalRole) {
                const tribunal_llamado = new TribunalLlamado();
                tribunal_llamado.llamado = newLlamado;
                tribunal_llamado.usuario = usuario;
                tribunal_llamado.tipoMiembro = tribunal?.type;
                tribunal_llamado.orden = tribunal?.order;
                tribunal_llamado.motivoRenuncia = "";
                await getRepository(TribunalLlamado).save(tribunal_llamado);
              }
            }
          })
        );
        await crearTribunales;

        const createEtapas = Promise.all(
          etapas?.map(async (etapa, index) => {
            const newEtapa = new Etapa();
            newEtapa.plazoDias = etapa?.plazoDiasMaximo;
            newEtapa.nombre = etapa?.nombre;
            if (index === 0) {
              newEtapa.postulantes = createdPostulantesLlamado;
            }
            newEtapa.llamado = newLlamado;
            newEtapa.total = 100;
            newEtapa.puntajeMin = etapa?.puntajeMinimo;
            const createdEtapa = await getRepository(Etapa).save(newEtapa);
            const createSubEtapas = Promise.all(
              etapa?.subetapas?.map(async (subetapa) => {
                const newSubEtapa = new Subetapa();
                newSubEtapa.nombre = subetapa?.nombre;
                newSubEtapa.puntajeMaximo = subetapa?.puntajeMaximo;
                newSubEtapa.etapa = createdEtapa;
                newSubEtapa.puntajeTotal = 0;
                const createdSubEtapa = await getRepository(Subetapa).save(
                  newSubEtapa
                );
                const crearRequisitos = Promise.all(
                  subetapa?.requisitos?.map(async (requisito) => {
                    const newRequisito = new Requisito();
                    newRequisito.nombre = requisito.nombre;
                    newRequisito.excluyente = requisito?.excluyente;
                    newRequisito.puntajeSugerido = requisito?.puntaje;
                    newRequisito.subetapa = createdSubEtapa;
                    await getRepository(Requisito).save(newRequisito);
                  })
                );
                await crearRequisitos;
              })
            );
            await createSubEtapas;
          })
        );

        await createEtapas;

        let categoriasToInsert: Categoria[] = [];
        const categoriasCreate = Promise.all(
          categorias?.map(async (categoryId) => {
            const categoria = await getRepository(Categoria).findOne({
              id: categoryId,
            });
            if (categoria) {
              categoriasToInsert?.push(categoria);
            }
          })
        );
        await categoriasCreate;
        llamado.categorias = categoriasToInsert;
        await getRepository(Llamado).save(llamado);

        const loadedLlamadoInfo = await getRepository(Llamado).findOne(
          {
            id: newLlamado?.id,
          },
          {
            relations: ["estadoActual", "cargo", "postulantes"],
          }
        );
        const text = `
        El ${
          isAdmin ? "Admin" : "Miembro del tribunal"
        } <span class="userColor" >${loggedUserInfo?.name} ${
          loggedUserInfo?.lastName
        }</span> creo el llamado '${llamado?.nombre}'`;

        await generateHistorialItem({
          text: text,
          llamadoId: llamado?.id,
          userId: loggedUserInfo?.id,
        });

        llamadoSub.publish("List_Llamados", {
          llamadoCreado: formatLlamadoToList(loadedLlamadoInfo),
        });

        return {
          ok: true,
          message: "Llamado creado correctamente",
        };
      } catch (error) {
        if (error?.message?.includes("Duplicate entry")) {
          return {
            ok: false,
            message: "Ya existe un llamado con este nombre o referencia",
          };
        }
        return {
          ok: false,
          message: error?.message,
        };
      }
    },
    deshabilitarLlamados: async (
      _: any,
      { llamados }: { llamados: number[] },
      context: any
    ): Promise<LlamadoCreateResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);

        const disabledLlamados = Promise.all(
          llamados?.map(async (llamadoId: number) => {
            const llamado = await getRepository(Llamado).findOne({
              id: llamadoId,
            });
            const nuevoEstado = await getRepository(
              EstadoPosibleLlamado
            ).findOne({ nombre: EstadoLlamadoEnum.eliminado });
            if (nuevoEstado && llamado) {
              llamado.estadoActual = nuevoEstado;
              await getRepository(Llamado).save(llamado);
            }
            const llamadoInfo = formatLlamadoToList(llamado);
            llamadoSub.publish("List_Llamados", {
              llamadoCreado: llamadoInfo,
            });
          })
        );
        await disabledLlamados;

        return {
          ok: true,
          message: "Llamados deshabilitados correctamente",
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || "Error al deshabilitar llamados",
        };
      }
    },
    cambiarEstadoLlamado: async (
      _: any,
      { info }: { info: CambiarEstadoLlamadoInput },
      context: any
    ) => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const isAdmin = userIsAdmin(loggedUserInfo);

        const llamado = await getRepository(Llamado).findOne({
          id: info.llamadoId,
        });
        if (!llamado) {
          throw new Error("El llamado no existe");
        }
        const estado = await getRepository(EstadoPosibleLlamado).findOne({
          nombre: info.estado,
        });
        if (!estado) {
          throw new Error("El estado no existe");
        }
        const etapa = await getRepository(Etapa).findOne({
          id: info.etapa,
        });

        if (!etapa) {
          throw new Error("La etapa no existe");
        }
        // create historial item
        // send mail
        llamado.etapaActual = etapa;
        llamado.estadoActual = estado;
        llamado.etapaUpdated = new Date();
        llamado.updatedAt = new Date();
        await getRepository(Llamado).save(llamado);

        const text = `
          El ${
            isAdmin ? "Admin" : "Miembro del tribunal"
          } <span class="userColor" >${loggedUserInfo?.name} ${
          loggedUserInfo?.lastName
        }</span>
          cambio el estado del llamado '${
            llamado?.nombre
          }' a <span class="estadoColor">${
          info?.estado
        }</span> , y la etapa actual a <span class="estadoColor">${
          etapa?.nombre
        }</span>
        `;

        await generateHistorialItem({
          text: text,
          llamadoId: llamado?.id,
          userId: loggedUserInfo?.id,
        });
        const loadedLlamadoInfo = await getRepository(Llamado).findOne(
          {
            id: llamado?.id,
          },
          {
            relations: ["estadoActual", "cargo", "postulantes"],
          }
        );
        llamadoSub.publish("List_Llamados", {
          llamadoCreado: formatLlamadoToList(loadedLlamadoInfo),
        });

        return {
          ok: true,
          message: "Estado actualizado correctamente",
        };
      } catch (error) {
        console.log(error);
        return {
          ok: false,
          message: error?.message || "Error al cambiar estado del llamado",
        };
      }
    },

    cambiarCambioLlamado: async (
      _: any,
      { info }: { info: CambiarCambioLlamadoInput },
      context: any
    ) => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const isAdmin = userIsAdmin(loggedUserInfo);
        const historialItem = await getRepository(HistorialItem).findOne(
          {
            id: info.historialItemId,
          },
          {
            relations: ["usuario", "llamado", "cambio"],
          }
        );
        const cambio = await getRepository(Cambio).findOne(
          {
            id: info?.cambioId,
          },
          {
            relations: ["postulante", "postulante.postulante"],
          }
        );
        if (!cambio || !historialItem) {
          throw new Error("Error al validar los datos enviados");
        }
        cambio.cambio = info?.accept;
        await getRepository(Cambio).save(cambio);

        if (info?.accept === true) {
          console.log("si, accept");
          const postulanteLlamado = await getRepository(
            PostulanteLlamado
          ).findOne({
            id: cambio?.postulante?.id,
          });
          console.log("postulanteLlamadoId", postulanteLlamado?.id);
          if (!postulanteLlamado) {
            throw new Error("Error al validar los datos enviados");
          }
          const newEstado = await getRepository(EstadoPostulante).findOne({
            nombre: cambio.nombre,
          });
          postulanteLlamado.estadoActual = newEstado;
          await getRepository(PostulanteLlamado).save(postulanteLlamado);
        }

        const text = `
          El 
          ${isAdmin ? `Administrador (CDP)` : `Miembro del tribunal`}
          <span class="userColor">"${
            historialItem?.usuario?.name
          }"</span> cambió el estado del postulante <span class="userColor" >"${
          cambio?.postulante?.postulante?.nombres
        }"</span> a <span class="estadoColor" >"${cambio?.nombre}"</span>
        `;

        await generateHistorialItem({
          text: text,
          llamadoId: historialItem?.llamado?.id,
          userId: loggedUserInfo?.id,
        });

        return {
          ok: true,
          message: "Estado actualizado correctamente",
        };
      } catch (error) {
        return {
          ok: false,
          message:
            error?.message || "Error al cambiar el estado de este postulante",
        };
      }
    },
    renunciarLlamado: async (
      _: any,
      { info }: { info: RenunciarLlamadoInput },
      context: any
    ) => {
      try {
        await checkAuth(context, [EnumRoles.tribunal]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const llamado = await getRepository(Llamado).findOne({
          id: info.llamadoId,
        });
        const usuario = await getRepository(Usuario).findOne({
          id: info.userId,
        });
        if (!llamado || !usuario) {
          throw new Error("Usuario o llamado invalido");
        }

        const tribunalLlamado = await getRepository(TribunalLlamado).findOne(
          {
            usuario: usuario,
            llamado: llamado,
          },
          {
            relations: ["llamado", "usuario"],
          }
        );

        if (!tribunalLlamado) {
          throw new Error("Usuario o llamado invalido");
        }
        tribunalLlamado.motivoRenuncia = info.motivoRenuncia;
        await getRepository(TribunalLlamado).save(tribunalLlamado);

        const text = `
        El 'Miembro del tribunal'
         <span class="userColor" >${loggedUserInfo?.name} ${loggedUserInfo?.lastName}</span>
        renuncio al llamado <span class="estadoColor">${llamado?.nombre}</span>`;

        await generateHistorialItem({
          text: text,
          llamadoId: llamado?.id,
          userId: loggedUserInfo?.id,
        });
        return {
          ok: true,
          message: "Renunciaste al tribunal correctamente",
        };
      } catch (error) {
        return {
          ok: false,
          message: error?.message || "Error al renunciar al llamado",
        };
      }
    },
    avanzarEtapaPostulanteInLlamado: async (
      _: any,
      { data }: { data: AvanzarEtapaData },
      context: any
    ): Promise<MessageResponse> => {
      try {
        // await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal, EnumRoles.cordinador]);
        console.log("postulanteId es", data.postulanteId);
        console.log("llamadoId es", data.llamadoId);
        const postulLlamado = await getRepository(PostulanteLlamado).findOne({
          where: {
            llamado: { id: data.llamadoId },
            postulante: { id: data.postulanteId },
          },
          relations: ["postulante", "llamado", "etapa", "estadoActual"],
        });
        if (!postulLlamado) {
          throw new Error(
            "No se ha encontrado el postulante en el llamado especificado."
          );
        }
        console.log("PostulanteLlamado", postulLlamado.estadoActual);

        const etapa = postulLlamado.etapa;
        const etapasInLlamado = await getRepository(Etapa).find({
          where: {
            llamado: { id: data.llamadoId },
          },
          order: { createdAt: "ASC" },
          relations: ["llamado"],
        });

        const indexEtapaActual = etapasInLlamado.findIndex(
          (currEtapa) => currEtapa.id === etapa.id
        );
        let cantidadDeEtapas = 0;
        let etapaActual = data.currentEtapa;
        if (indexEtapaActual !== -1) {
          cantidadDeEtapas = etapasInLlamado.length;
        }

        if (etapaActual < 0 || etapaActual > etapasInLlamado.length) {
          throw new Error(
            "El índice de la etapa actual recibido no es válido. (menor a 0 o mayor a la cantidad de etapas)"
          );
        }

        const siguienteEtapa = etapaActual + 1;
        console.log("etapa actual ", etapaActual);
        console.log("siguienteEtapa ", siguienteEtapa);
        if (siguienteEtapa > cantidadDeEtapas) {
          throw new Error("No hay etapa a la que avanzar al postulante.");
        } else {
          postulLlamado.etapa = etapasInLlamado[siguienteEtapa - 1];
          console.log(etapasInLlamado[siguienteEtapa - 1]);
        }

        if (postulLlamado.estadoActual.nombre !== "Cumple Requisitos") {
          throw new Error(
            "El postulante debe de encontrarse en el estado 'Cumple Requisitos' para este llamado."
          );
        }

        await getRepository(PostulanteLlamado).save(postulLlamado);
        return {
          ok: true,
          message: "Etapa del postulante avanzada correctamente.",
        };
      } catch (error) {
        console.log("AvanzarEtapaPostulanteInLlamado Error", error);
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
      { filters }: { filters: ListarLlamadoInputQuery },
      context: any,
    ): Promise<LlamadoList[]> => {
      await checkAuth(context, [
        EnumRoles.admin,
        EnumRoles.tribunal,
        EnumRoles.cordinador,
      ]);
      const loggedUserInfo = await getLoggedUserInfo(context);
      const isAdmin = userIsAdmin(loggedUserInfo);

      const llamados = await getRepository(Llamado).find({
        relations: [
          'estadoActual',
          'cargo',
          'postulantes',
          'solicitante',
          'miembrosTribunal',
          'miembrosTribunal.usuario',
          'categorias',
        ],
      });

      const filterLlamados = llamados?.filter((llamado) => {
        if (isAdmin) {
          return true;
        } else {
          const existsOnTribunal =
            llamado?.miembrosTribunal?.find(
              (tribunal) =>
                tribunal?.usuario?.id === loggedUserInfo?.id &&
                tribunal?.motivoRenuncia === ""
            ) !== undefined;
          return (
            llamado?.solicitante?.id === loggedUserInfo?.id || existsOnTribunal
          );
        }
      });

      // with filters
      let llamadosWithFilters: Llamado[] = filterLlamados;

      if (filters?.selectedCargos?.length > 0) {
        const newLlamados = llamadosWithFilters?.filter((item) => {
          const cargoId = item?.cargo?.id;
          return filters?.selectedCargos?.includes(cargoId);
        });
        llamadosWithFilters = newLlamados;
      }

      if (filters?.selectedCategorias?.length > 0) {
        llamadosWithFilters?.forEach((item) => {
          const categoriasIdsOfLlamado = item?.categorias?.map(
            (item) => item?.id,
          );

          filters?.selectedCategorias?.forEach((catId) => {
            if (categoriasIdsOfLlamado?.includes(catId)) {
              // correct
              if (
                !llamadosWithFilters?.find(
                  (llam) => llam.id === item?.id,
                )
              ) {
                llamadosWithFilters = [...llamadosWithFilters, item];
              }
            } else {
              // no correct
              if (
                llamadosWithFilters?.find(
                  (llam) => llam.id === item?.id,
                )
              ) {
                llamadosWithFilters = llamadosWithFilters?.filter(
                  (llam) => llam?.id !== item?.id,
                );
              }
            }
          });
        });
      }

      if (filters?.selectedPostulantes?.length > 0) {
        llamadosWithFilters?.forEach((item) => {
          const postulantesOfLlamado = item?.postulantes?.map(
            (item) => item?.id,
          );
          //1 , 2 ,3

          //1, 2
          filters?.selectedPostulantes?.forEach((postId) => {
            if (postulantesOfLlamado?.includes(postId)) {
              // correct
              if (
                !llamadosWithFilters?.find(
                  (llam) => llam.id === item?.id,
                )
              ) {
                llamadosWithFilters = [...llamadosWithFilters, item];
              }
            } else {
              // no correct
              if (
                llamadosWithFilters?.find(
                  (llam) => llam.id === item?.id,
                )
              ) {
                llamadosWithFilters = llamadosWithFilters?.filter(
                  (llam) => llam?.id !== item?.id,
                );
              }
            }
          });
        });
      }

      if (filters?.selectedEstados?.length > 0) {
        const newLlamados = llamadosWithFilters?.filter((item) => {
          const estadoActual = item?.estadoActual.nombre;
          return filters?.selectedEstados?.includes(estadoActual);
        });
        llamadosWithFilters = newLlamados;
      }

      const allLlamadosFormtted =
        llamadosWithFilters?.map((llamado) => {
          return formatLlamadoToList(llamado);
        }) || [];

      return allLlamadosFormtted;
    },
    getLlamadoById: async (
      _: any,
      { llamadoId }: { llamadoId: number },
      context: any
    ) => {
      try {
        await checkAuth(context, [
          EnumRoles.admin,
          EnumRoles.tribunal,
          EnumRoles.cordinador,
        ]);
        const loggedUserInfo = await getLoggedUserInfo(context);
        const isAdmin = userIsAdmin(loggedUserInfo);
        const llamadoInfo = await getRepository(Llamado).findOne(
          { id: llamadoId },
          {
            relations: [
              "etapas",
              "etapaActual",
              "cargo",
              "solicitante",
              "etapas.subetapas",
              "etapas.subetapas.requisitos",
              "categorias",
              "postulantes",
              "postulantes.postulante",
              "miembrosTribunal",
              "miembrosTribunal.usuario",
              "historiales",
              "historiales.cambio",
              "archivos",
              "archivos.tipoArchivo",
              "archivosFirma",
              "archivosFirma.firmas",
              "archivosFirma.firmas.usuario",
              "estadoActual",
            ],
          }
        );
        if (!llamadoInfo) {
          throw new Error("No existe el llamado");
        }
        const existsOnTribunal =
          llamadoInfo?.miembrosTribunal?.find(
            (tribunal) =>
              tribunal?.usuario?.id === loggedUserInfo?.id &&
              tribunal?.motivoRenuncia === ""
          ) !== undefined;
        const isParticipe =
          llamadoInfo?.solicitante?.id === loggedUserInfo?.id ||
          existsOnTribunal;

        if (!isParticipe && !isAdmin) {
          throw new Error(
            "Error al acceder a la informacion de llamado, permisos invalidos"
          );
        }
        return {
          ...llamadoInfo,
          etapaUpdated: llamadoInfo?.etapaUpdated?.toString(),
        };
      } catch (error) {
        throw error;
      }
    },
    getEtapaActualPostInLlamado: async (
      _: any,
      { llamadoId, postulanteId }: { llamadoId: number; postulanteId: number },
      context: any
    ) => {
      try {
        // await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal, EnumRoles.cordinador]);
        const postulLlamado = await getRepository(PostulanteLlamado).findOne({
          where: {
            llamado: { id: llamadoId },
            postulante: { id: postulanteId },
          },
          relations: [
            "postulante",
            "llamado",
            "etapa",
            "etapa.subetapas",
            "etapa.subetapas.requisitos",
            "etapa.subetapas.requisitos.allPuntajes",
            "etapa.subetapas.requisitos.allPuntajes.postulante",
            "etapa.subetapas.requisitos.allPuntajes.postulante.postulante",
          ],
        });

        if (!postulLlamado) {
          throw new Error(
            "No se ha encontrado el postulante en el llamado especificado."
          );
        }
        // console.log("PostulanteLlamado", postulLlamado.etapa);
        const etapa = postulLlamado.etapa;
        const etapasInLlamado = await getRepository(Etapa).find({
          where: {
            llamado: { id: llamadoId },
          },
          order: { createdAt: "ASC" },
          relations: ["llamado"],
        });

        const indexEtapaActual = etapasInLlamado.findIndex(
          (currEtapa) => currEtapa.id === etapa.id
        );
        let cantidadDeEtapas = 0;
        let etapaActual = 0;
        if (indexEtapaActual !== -1) {
          cantidadDeEtapas = etapasInLlamado.length;
          etapaActual = indexEtapaActual + 1;
        }

        let sum = Number(0);
        etapa.subetapas.map((currSub) =>
          currSub?.requisitos?.map(
            (currReq) =>
              (sum += Number(
                currReq?.allPuntajes?.find(
                  (puntaje) =>
                    puntaje?.postulante?.postulante?.id === postulanteId
                )?.valor || 0
              ))
          )
        );

        const currentPostulanteEtapa: EtapaGrilla = {
          id: etapa.id,
          nombre: etapa.nombre,
          puntajeMin: etapa.puntajeMin,
          plazoDias: etapa.plazoDias,
          total: sum,
          currentEtapa: Number(etapaActual),
          cantEtapas: Number(cantidadDeEtapas),
          subetapas: etapa.subetapas.map((currSub) => {
            return {
              id: currSub.id,
              nombre: currSub.nombre,
              puntajeMaximo: currSub?.puntajeMaximo,
              subtotal: currSub?.puntajeTotal,
              requisitos: currSub?.requisitos.map(
                (currReq): RequisitoType => {
                  return {
                    id: currReq.id,
                    nombre: currReq.nombre,
                    excluyente: currReq.excluyente,
                    puntajeSugerido: currReq.puntajeSugerido,
                    puntaje:
                      currReq?.allPuntajes?.find(
                        (puntaje) =>
                          puntaje?.postulante?.postulante?.id === postulanteId
                      )?.valor || 0,
                  };
                }
              ),
            };
          }),
        };
        return currentPostulanteEtapa;
      } catch (error) {
        throw error;
      }
    },
    listarPuntajesPostulantes: async (
      _: any,
      { llamadoId }: { llamadoId: number },
      context: any,
    ): Promise<any> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const llamado = await getRepository(Llamado).findOne({ id: llamadoId }, { relations: ['postulantes', 'postulantes.puntajes', 'postulantes.postulante', 'postulantes.puntajes.requisito'] });
        if (!llamado) {
          throw new Error("llamado invalido");
        }

        const dataToSend: any[] = [];

        await Promise.all(llamado?.postulantes?.map(async (post) => {
          const item = {
            postulanteId: post?.postulante?.id,
            requisitos: post?.puntajes?.map((puntaje) => {
              return {
                requisitoId: puntaje?.requisito?.id,
                puntaje: puntaje?.valor,
              }
            })
          }
          dataToSend?.push(item);
        }))

        return dataToSend;
      } catch (error) {
        console.log(error)
        return [];
      }
    },
    listarLlamadosByUser: async (
      _: any,
      { userId }: { userId: number },
      context: any,
    ): Promise<LlamadoList[]> => {
      await checkAuth(context, [
        EnumRoles.admin,
        EnumRoles.tribunal,
        EnumRoles.cordinador,
      ]);

      const llamados = await getRepository(Llamado).find({
        relations: [
          'estadoActual',
          'cargo',
          'postulantes',
          'solicitante',
          'miembrosTribunal',
          'miembrosTribunal.usuario',
          'categorias',
        ],
      });

      const filterLlamados = llamados?.filter((llamado) => {
          const existsOnTribunal =
            llamado?.miembrosTribunal?.find(
              (tribunal) =>
                tribunal?.usuario?.id === userId &&
                tribunal?.motivoRenuncia === ""
            ) !== undefined;
          return (
            llamado?.solicitante?.id === userId || existsOnTribunal
          );
      });

      const allLlamadosFormtted =
      filterLlamados?.map((llamado) => {
          return formatLlamadoToList(llamado);
        }) || [];

      return allLlamadosFormtted;
    },
  },
  Subscription: {
    llamadoCreado: {
      subscribe: () => llamadoSub.asyncIterator(["List_Llamados"]),
    },
  },
};

export default llamadoController;

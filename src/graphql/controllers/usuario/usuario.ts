import Encryption from '../../../utilities/encryption.utility';
import { Usuario } from '../../../entities/usuarios/usuarios.entity';
import {
  DEFAULT_USER_IMAGE,
  formatUserToList,
} from '/src/utilities/user';
import {
  CreateUserResponse,
  CreateUserType,
  LoginCredentials,
  ResetPasswordInput,
  UserList,
  UsuarioInfo,
} from 'types/user';
import { getRepository } from 'typeorm';
import { Roles as EnumRoles } from 'enums/Roles';
import { Roles } from 'entities/roles/roles.entity';
import { sendEmail } from 'utilities/mail';
import {
  accountActivateTemplate,
  resetPasswordActivate,
} from 'mailTemplates/activateAccount.template';
import { checkAuth } from 'utilities/checkAuth';
import { PubSub } from 'graphql-subscriptions';
import { PostulanteList } from 'types/posstulante';
import { Postulante } from 'entities/postulante/postulante.entity';

const pubsub = new PubSub();

const usuarioController: any = {
  Mutation: {
    createUser: async (
      _: any,
      {
        data,
      }: {
        data: CreateUserType;
      },
      context: any
    ): Promise<CreateUserResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const newUser = new Usuario();

        newUser.name = data?.name;
        newUser.email = data?.email;
        newUser.lastName = data.lastname;
        newUser.documento = data?.documento;
        newUser.imageUrl =
          data?.image && data?.image !== ''
            ? data?.image
            : DEFAULT_USER_IMAGE;
        if (data?.password && data?.password !== '') {
          const newPassword = await Encryption.generateHash(
            data?.password,
            10,
          );
          newUser.password = newPassword;
          newUser.telefono = data?.telefono;
        } else {
          newUser.password = '';
        }

        if (data?.roles?.length === 0) {
          throw new Error('El usuario debe tener un rol');
        }

        //set user roles
        const newUserRoles: Roles[] = [];
        const allRpomises = Promise.all(
          data?.roles?.map(async (item: EnumRoles) => {
            const rol = await getRepository(Roles).findOne({
              nombre: item,
            });
            newUserRoles?.push(rol);
          }),
        );
        await allRpomises;
        newUser.roles = newUserRoles;

        if (!data?.itr) {
          throw new Error('El usuario debe seleccionar un ITR');
        }
        newUser.itr = data?.itr;

        newUser.biografia = data?.biografia;
        const resetPasswordToken = await Encryption.generateJWT(
          'email',
          newUser?.email,
        );
        newUser.resetPasswordToken = resetPasswordToken;

        await sendEmail(
          newUser?.email,
          'Bienvenido a CallFlow',
          accountActivateTemplate(
            resetPasswordToken,
            process.env.APP_FRONTEND_URL,
            `${newUser?.name} ${newUser?.lastName}`,
          ),
        );

        const userCreation = await getRepository(Usuario).save(newUser);
        if (userCreation.id) {
          pubsub.publish('List_Users', {
            userCreated: formatUserToList(userCreation),
          });
          return {
            ok: true,
            message: 'Usuario creado correctamente',
          };
        } else {
          throw new Error('Eror al crear usuario');
        }
      } catch (e) {
        console.log('CreateUser Error', e);
        return {
          ok: false,
          message: 'Error al crear usuario',
        };
      }
    },
    login: async (
      _: any,
      {
        data,
      }: {
        data: LoginCredentials;
      },
    ): Promise<CreateUserResponse> => {
      try {
        const user = await getRepository(Usuario).findOne({
          email: data?.email,
        });

        if (!user || !user?.id) {
          throw new Error('Credenciales invalidas');
        }
        if (!user?.activo) {
          throw new Error('Usuario desactivado');
        }

        console.log(user?.password);
        const isCorrectPassword = await Encryption.verifyHash(
          data?.password,
          user?.password,
        );
        const jwt = await Encryption.generateJWT(
          'uid',
          user?.id?.toString(),
        );

        if (isCorrectPassword) {
          return {
            ok: true,
            message: 'Bienvenido al sistema',
            token: jwt,
          };
        } else {
          throw new Error('Credenciales invalidas');
        }
      } catch (e) {
        console.log('Login Error', e);
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    checkToken: async (
      _: any,
      {
        token,
      }: {
        token: string;
      },
    ): Promise<UserList> => {
      try {
        const info = await Encryption.verifyJWT(token);
        if (!info || !info?.data?.uid) {
          throw new Error('Token invalido');
        }
        const uid = info?.data?.uid;
        const userInfo = await getRepository(Usuario).findOne(
          { id: uid },
          {
            relations: ['roles'],
          },
        );
        if (!userInfo) {
          throw new Error('Usuario no encontrado');
        }
        const formatRoles = userInfo?.roles?.map((rol) => rol?.nombre);

        const dataToReturn = {
          ...userInfo.toJSON(),
          roles: formatRoles,
        } as any;
        return dataToReturn as UserList;
      } catch (e) {
        throw new Error(e?.message);
      }
    },
    forgetPassword: async (
      _: any,
      { info }: { info: { email: string } },
    ) => {
      try {
        const userEmail = info?.email;
        const userInfo = await getRepository(Usuario).findOne({
          email: userEmail,
        });
        if (!userInfo?.id || !userInfo) {
          throw new Error('Error al restablecer la password');
        }
        const resetPasswordToken = await Encryption.generateJWT(
          'email',
          userInfo?.email,
        );
        userInfo.resetPasswordToken = resetPasswordToken;
        await getRepository(Usuario).save(userInfo);
        await sendEmail(
          userInfo?.email,
          'Restablece tu contraseña',
          resetPasswordActivate(
            resetPasswordToken,
            process.env.APP_FRONTEND_URL,
            `${userInfo?.name} ${userInfo?.lastName}`,
          ),
        );

        return {
          ok: true,
          message: 'Se envio un correo para restablecer la password',
        };
      } catch (error) {
        throw new Error(
          error?.message || 'Error al restablecer la password',
        );
      }
    },
    resetPassword: async (
      _: any,
      { info: data }: { info: ResetPasswordInput },
    ): Promise<CreateUserResponse> => {
      try {
        const { token, password, newPassword } = data;
        const info = await Encryption.verifyJWT(token);
        if (!info || !info?.data?.email) {
          throw new Error('Token invalido');
        }
        const userEmail = info?.data?.email;
        const userInfo = await getRepository(Usuario).findOne({
          email: userEmail,
        });
        if (!userInfo) {
          throw new Error('Usuario no encontrado');
        }
        if (password !== newPassword) {
          throw new Error('Error al validar la password');
        }

        if (token !== userInfo?.resetPasswordToken) {
          throw new Error('Token invalido');
        }

        const encryptedPass = await Encryption.generateHash(
          newPassword,
          10,
        );
        userInfo.password = encryptedPass;
        userInfo.resetPasswordToken = '';
        if (!userInfo?.activo) {
          userInfo.activo = true;
        }
        await getRepository(Usuario).save(userInfo);

        return {
          ok: true,
          message: 'Usuario actualizado correctamente',
        } as CreateUserResponse;
      } catch (e) {
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    disabledUser: async (
      _: any,
      { uid }: { uid: number },
      context: any,
    ): Promise<CreateUserResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const userInfo = await getRepository(Usuario).findOne(
          {
            id: uid,
          },
          {
            relations: ['roles', 'tribunales'],
          },
        );
        if (!userInfo || !userInfo?.id) {
          throw new Error('Usuario invalido');
        }
        userInfo.activo = false;
        pubsub.publish('List_Users', {
          userCreated: formatUserToList(userInfo),
        });
        await getRepository(Usuario).save(userInfo);
        return {
          ok: true,
          message: 'Usuario desactivado correctamente',
        } as CreateUserResponse;
      } catch (e) {
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
    updateUser: async (
      _: any,
      { info }: { info: UserList },
      context: any,
    ): Promise<CreateUserResponse> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const userInfo = await getRepository(Usuario).findOne(
          {
            id: info?.id,
          },
          {
            relations: ['roles', 'tribunales'],
          },
        );

        if (!userInfo || !userInfo?.id) {
          throw new Error('Usuario invalido');
        }

        userInfo.telefono = info?.telefono;

        userInfo.name = info?.name;
        userInfo.lastName = info?.lastName;
        userInfo.documento = info?.documento;
        if (info?.imageUrl) {
          userInfo.imageUrl =
            userInfo?.imageUrl && info?.imageUrl !== ''
              ? info?.imageUrl
              : DEFAULT_USER_IMAGE;
        }

        const newUserRoles: Roles[] = [];
        const allRpomises = Promise.all(
          info?.roles?.map(async (item: EnumRoles) => {
            const rol = await getRepository(Roles).findOne({
              nombre: item,
            });
            newUserRoles?.push(rol);
          }),
        );
        await allRpomises;
        userInfo.roles = newUserRoles;
        if (!info?.itr) {
          throw new Error('El usuario debe seleccionar un ITR');
        }
        userInfo.itr = info?.itr;
        userInfo.biografia = info.biografia || '';

        await getRepository(Usuario).save(userInfo);
        pubsub.publish('List_Users', {
          userCreated: formatUserToList(userInfo),
        });
        return {
          ok: true,
          message: 'Usuario actualizado correctamente',
        } as CreateUserResponse;
      } catch (e) {
        return {
          ok: false,
          message: e?.message,
        };
      }
    },
  },
  Query: {
    listUsuarios: async (_: any, __: any, context: any): Promise<UserList[]> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const usuarios = await getRepository(Usuario).find({
          relations: ['roles', 'tribunales'],
        });
        const formatUsers: UserList[] = usuarios.map((user) => {
          return formatUserToList(user);
        });

        return formatUsers;
      } catch (e) {
        return [];
      }
    },
    listarSolicitantes: async (_: any, __: any, context: any): Promise<UserList[]> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const usuarios = await getRepository(Usuario)
          .createQueryBuilder('usuario')
          .innerJoin('usuario.roles', 'rol')
          .where('rol.nombre = :nombre', {
            nombre: EnumRoles.cordinador,
          })
          .getMany();
        const formatUsers: UserList[] = usuarios.map((user) => {
          return formatUserToList(user);
        });

        return formatUsers;
      } catch (e) {
        throw new Error("Permisos insuficientes")
        return [];
      }
    },
    listarMiembrosTribunal: async (_: any, __: any, context: any): Promise<UserList[]> => {
      try {
        await checkAuth(context, [EnumRoles.admin]);
        const usuarios = await getRepository(Usuario)
          .createQueryBuilder('usuario')
          .innerJoin('usuario.roles', 'rol')
          .where('rol.nombre = :nombre', {
            nombre: EnumRoles.tribunal,
          })
          .getMany();
        const formatUsers: UserList[] = usuarios.map((user) => {
          return formatUserToList(user);
        });

        return formatUsers;
      } catch (e) {
        throw new Error("Permisos insuficientes")
        return [];
      }
    },
    getUserInfoById: async (
      _: any,
      {
        usrId,
      }: {
        usrId: number;
      },
      context: any,
    ): Promise<UserList> => {
      try {
        await checkAuth(context, [EnumRoles.admin, EnumRoles.tribunal, EnumRoles.cordinador,]);
        const userInfo = await getRepository(Usuario).findOne(
          { id: usrId },
          {
            relations: ['roles'],
          },
        );
        if (!userInfo) {
          throw new Error('Usuario no encontrado');
        }
        const formatRoles = userInfo?.roles?.map((rol) => rol?.nombre);

        const dataToReturn = {
          ...userInfo.toJSON(),
          roles: formatRoles,
        } as any;
        return dataToReturn as UserList;
      } catch (e) {
        throw new Error(e?.message);
      }
    },
  },
  Subscription: {
    userCreated: {
      subscribe: () => pubsub.asyncIterator(['List_Users']),
    },
  },
};

export default usuarioController;

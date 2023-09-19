import Encryption from '../../../utilities/encryption.utility';
import { Usuario } from '../../../entities/usuarios/usuarios.entity';
import { DEFAULT_USER_IMAGE } from '/src/utilities/user';
import {
  CreateUserResponse,
  CreateUserType,
  LoginCredentials,
  UsuarioInfo,
} from 'types/user';
import { getRepository } from 'typeorm';
import { Roles as EnumRoles } from 'enums/Roles';
import { Roles } from 'entities/roles/roles.entity';

const usuarioController: any = {
  Mutation: {
    getAlgo: () => "algo",
    createUser: async (_: any,{
      data,
    }: {
      data: CreateUserType;
    }): Promise<CreateUserResponse> => {
      try {
        const newUser = new Usuario();
        const newPassword = await Encryption.generateHash(
          data?.password,
          10,
        );
        newUser.name = data?.name;
        newUser.email = data?.email;
        newUser.lastName = data.lastname;
        newUser.imageUrl =
          data?.image && data?.image !== ''
            ? data?.image
            : DEFAULT_USER_IMAGE;
        newUser.password = newPassword;
        newUser.telefono = data?.telefono;

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
        console.log('newUserRoles', newUserRoles)
        newUser.roles = newUserRoles;

        if (!data?.itr) {
          throw new Error('El usuario debe seleccionar un ITR');
        }
        newUser.itr = data?.itr;

        newUser.biografia = data?.biografia;
        const userCreation = await getRepository(Usuario).save(newUser);
        if (userCreation.id) {
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
    login: async (_: any,{
      data,
    }: {
      data: LoginCredentials;
    }): Promise<CreateUserResponse> => {
      try {
        const user = await getRepository(Usuario).findOne({
          email: data?.email,
        });

        if (!user || !user?.id) {
          throw new Error('Credenciales invalidas');
        }

        //   if (!user?.activo) {
        //     throw new Error('La cuenta esta desactivada');
        //   }

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
    checkToken: async (_: any,{
      token,
    }: {
      token: string;
    }): Promise<UsuarioInfo> => {
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
        return dataToReturn as UsuarioInfo;
      } catch (e) {
        return null;
      }
    },
  },
};

export default usuarioController;

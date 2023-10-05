import { Roles } from 'enums/Roles';
import Encryption from './encryption.utility';
import { getRepository } from 'typeorm';
import { Usuario } from 'entities/usuarios/usuarios.entity';

// this fonction should be excetured when we need validate a user role in a function
// important: that function should be called out of try - catch
// also, this function should be called with await
export const checkAuth = async (context: any, roles: Roles[] = []) => {
  const headers = context?.headers;
  console.log(context);
  console.log('headers is', headers);
  if (roles?.length !== 0) {
    const token = headers?.authorization;
    if (!token || token === '') {
      throw new Error('Permisos insuficientes');
    }
    const validatedToken = await Encryption.verifyJWT(token);
    const uid = validatedToken?.data?.uid;
    if (!uid) {
      throw new Error('Token invalido');
    }
    const userInfo = await getRepository(Usuario).findOne(
      { id: uid },
      {
        relations: ['roles'],
      },
    );
    if (!userInfo) {
      throw new Error('Usuario invalido');
    }
    const formatUserRoles: Roles[] =
      userInfo?.roles?.map((rol) => rol.nombre as Roles) || [];

    let isIncluded = false;
    roles?.map((rol) => {
      if (formatUserRoles?.includes(rol)) {
        isIncluded = true;
      }
    });
    if (!isIncluded) {
      throw new Error('Permisos invalidos');
    }
  }

  // console.log("data is", data)
};

export const getLoggedUserInfo = async (
  context: any,
): Promise<Usuario> => {
  const headers = context?.headers;
  const token = headers?.authorization;
  if (!token || token === '') {
    throw new Error('Permisos insuficientes');
  }
  const validatedToken = await Encryption.verifyJWT(token);
  const uid = validatedToken?.data?.uid;
  if (!uid) {
    throw new Error('Token invalido');
  }
  const userInfo = await getRepository(Usuario).findOne(
    { id: uid },
    {
      relations: ['roles'],
    },
  );
  return userInfo;
};

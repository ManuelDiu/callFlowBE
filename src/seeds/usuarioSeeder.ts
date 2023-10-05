import bcrypt from 'bcrypt';
import { ITR } from 'enums/ITR';
import { Roles } from 'enums/Roles';
import { DEFAULT_USER_IMAGE } from 'utilities/user';

export const usuarioSeed = [
  {
    email: 'angelotunado02@gmail.com',
    documento: '55152135',
    password:
      '$2b$10$THZpUIbY7iM6I42XSTq1fuDK4JIe7bJ5wydl5clVkgYiyZJBSGKJe',
    name: 'Maxi',
    lastName: 'Olivera',
    biografia: '',
    imageUrl: DEFAULT_USER_IMAGE,
    telefono: "123123123",
    activo: true,
    itr: ITR.centrosur,
    roles: [
      {
        id: 1,
        nombre: Roles.admin,
      },
      {
        id: 2,
        nombre: Roles.tribunal,
      },
      {
        id: 3,
        nombre: Roles.cordinador,
      },
    ],
  },
  {
    email: 'mandiu003@gmail.com',
    documento: '48795687',
    password:
      '$2b$10$w/VuEea3u1TlZj0cxMHhJuaq47LAMC7Oko2flyJ5fCgwLv7UihJPq',
    name: 'Manuel',
    lastName: 'Diu',
    biografia: 'Esta es mi bio!!',
    imageUrl: DEFAULT_USER_IMAGE,
    telefono: "091321609",
    activo: true,
    itr: ITR.suroeste,
    roles: [
      {
        id: 1,
        nombre: Roles.admin,
      },
      {
        id: 2,
        nombre: Roles.tribunal,
      },
      {
        id: 3,
        nombre: Roles.cordinador,
      },
    ],
  },
];

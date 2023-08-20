import myDataSource from "../../dataSource";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { InputLogin } from "../types/InputLogin";
import { compareAsync } from "../utils/bcrypt";
import { SECRET_JWT_SEED, generateJWT } from "../utils/jwt";
import jwt from "jsonwebtoken"

const saltRounds = 10;

export const createUser = async (data: any) => {
  try {
    const persona = data?.persona as User;
    if (!persona || typeof persona === "undefined" || persona == null) {
        console.log("me llega", data)
      throw new Error("Error, usuario invalido");
    }

    const userPass = await bcrypt.hash(persona.password, 12);

    if (!userPass) {
      throw new Error("Error al procesar la contrase;a");
    }

    persona.password = userPass;

    const newpersona = await myDataSource.getRepository(User).create(persona);
    const result = await myDataSource.getRepository(User).save(newpersona);

    if (result?.id) {
      return {
        ok: true,
        message: "Persona creada correctamente",
      };
    } else {
      return {
        ok: false,
        message: "Error al crear persona",
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message || "Error al crear personaa",
    };
  }
};

export const login = async (data: any) => {
  try {
    const credentials = data?.credentials as InputLogin;

    if (!credentials.email || !credentials.password) {
      throw new Error("Credenciales invalidas");
    }
    const user = await myDataSource.getRepository(User).findOneBy({
      email: credentials.email,
    });

    const isSame = await compareAsync(credentials.password, user?.password);
    if (isSame) {
        const token = generateJWT(user?.id, user?.nombre);
      return {
        ok: true,
        token: token,
      };
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error: any) {
    return {
      ok: false,
      token: null,
    };
  }
};

export const getCurrentUser = async (data: any) => {
    try {
      const token = data?.token as string;
  
      const response = jwt.verify(token , SECRET_JWT_SEED) as any;


      if (response?.id) {
        const userInfo = await myDataSource.getRepository(User).findOneBy({id: response?.id});
        return userInfo;
      } else {
        return null;
      }
    } catch (error: any) {
        console.log(error)
      return null;
    }
  };

import jwt from "jsonwebtoken";

export const SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "secret_seed_word";
const DEFAULT_EXPIRATION_TIME = "2h";

export const generateJWT = (id: any, name?: any) => {
  return new Promise((resolve, reject) => {
    const payload = { id, name };

    jwt.sign(
      payload,
      SECRET_JWT_SEED,
      {
        expiresIn: DEFAULT_EXPIRATION_TIME,
      },
      (err, token) => {
        if (err) {
          reject("No se pudo generar el token");
        }
        resolve(token);
      }
    );
  });
};

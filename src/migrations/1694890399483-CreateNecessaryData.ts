import { estadoPostulanteSeed } from "../seeds/estadoPostulanteSeed";
import { Roles } from "../entities/roles/roles.entity";
import { rolesSeed } from "../seeds/roles.seed";
import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import { EstadoPostulante } from "../entities/estadoPostulante/estadoPostulante.entity";
import { estadoLlamadoSeed } from "../seeds/estadoLlamadoSeed";
import { EstadoPosibleLlamado } from "../entities/estadoLlamado/estadoLlamado.entity";
import { Usuario } from "entities/usuarios/usuarios.entity";
import { usuarioSeed } from "seeds/usuarioSeeder";
import { categoriaSeed } from "seeds/categoriaSeed";
import { cargoSeed } from "seeds/cargoSeed";
import { postulanteSeed } from "seeds/postulante";
import { Categoria } from "entities/categoria/categoria.entity";
import { Cargo } from "entities/cargo/cargo.entity";
import { Postulante } from "entities/postulante/postulante.entity";

export class asddgg1694890399483 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await getRepository(Roles).save(rolesSeed);
        await getRepository(EstadoPostulante).save(estadoPostulanteSeed);
        await getRepository(EstadoPosibleLlamado).save(estadoLlamadoSeed);
        await getRepository(Usuario).save(usuarioSeed);
        await getRepository(Categoria).save(categoriaSeed);
        await getRepository(Cargo).save(cargoSeed);
        await getRepository(Postulante).save(postulanteSeed);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}

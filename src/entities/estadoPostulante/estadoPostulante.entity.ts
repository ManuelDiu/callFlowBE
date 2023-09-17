import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { EstadoPostulanteEnum } from '../../enums/EstadoPostulanteEnum';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';

@Entity('estadoPost', { orderBy: { id: 'DESC' }})
export class EstadoPostulante extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    type: "enum",
    enum: EstadoPostulanteEnum,
  })
  @Unique(["nombre"])
  nombre: EstadoPostulanteEnum;

  @OneToMany(() => PostulanteLlamado, (estadopost) => estadopost.estadoActual)
  postulantes: PostulanteLlamado[];

  toJSON() {
    return this;
  }
}

import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { EstadoPostulanteEnum } from '../../enums/EstadoPostulanteEnum';

@Entity('cambio', { orderBy: { id: 'DESC' } })
export class Cambio extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  cambio: boolean;

  @ManyToOne(() => PostulanteLlamado, (e) => e.cambios)
  postulante: PostulanteLlamado;

  @Column({
    type: "enum",
    enum: EstadoPostulanteEnum,
  })
  nombre: EstadoPostulanteEnum;

  
  toJSON() {
    return this;
  }

}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';

@Entity('postulante', { orderBy: { id: 'DESC' } })
export class Postulante extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombres: string;

  @Column({ length: 100, nullable: true })
  apellidos: string;

  @Column({ length: 100, nullable: true })
  @Unique(["documento"])
  documento: string;

  @OneToMany(() => PostulanteLlamado, (postLlamado) => postLlamado.postulante)
  llamados: PostulanteLlamado[];

  toJSON() {
    return this;
  }

}

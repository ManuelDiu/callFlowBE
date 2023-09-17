import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Etapa } from '../etapa/etapa.entity';
import { Requisito } from '../requisito/requisito.entity';

@Entity('sbuetapa', { orderBy: { id: 'DESC' } })
export class Subetapa extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column()
  puntajeTotal: number;

  @Column()
  puntajeMaximo: number;

  @ManyToOne(() => Etapa, (etapa) => etapa.subetapas)
  etapa: Etapa;

  @OneToMany(() => Requisito, (subetapa) => subetapa.subetapa)
  requisitos: Requisito[];

  toJSON() {
    return this;
  }

}

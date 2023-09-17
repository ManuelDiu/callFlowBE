import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Subetapa } from '../subetapa/subetapa.entity';
import { Puntaje } from '../puntaje/puntaje.entity';

@Entity('requisito', { orderBy: { id: 'DESC' } })
export class Requisito extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column()
  puntajeSugerido: number;

  @Column()
  excluyente: boolean;

  @ManyToOne(() => Subetapa, (subetapa) => subetapa.requisitos)
  subetapa: Subetapa;

  @OneToMany(() => Puntaje, (a) => a.requisito)
  allPuntajes: Puntaje[];

  toJSON() {
    return this;
  }

}

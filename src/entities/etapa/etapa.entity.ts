import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Subetapa } from '../subetapa/subetapa.entity';
import { Template } from '../template/template.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { Llamado } from '../llamado/llamado.entity';

@Entity('etapa', { orderBy: { id: 'DESC' } })
export class Etapa extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column()
  plazoDias: number;

  @Column()
  puntajeMin: number;

  @Column()
  total: number;

  @OneToMany(() => Subetapa, (subetapa) => subetapa.etapa)
  subetapas: Subetapa[];

  @ManyToOne(() => Template, (e) => e.etapa)
  template: Template;

  @OneToMany(() => PostulanteLlamado, (a) => a.etapa)
  postulantes: PostulanteLlamado[];

  @ManyToOne(() => Llamado, (e) => e.etapas)
  llamado: Llamado;

  @OneToMany(() => Llamado, (e) => e.etapaActual)
  llamados: Llamado;

  toJSON() {
    return this;
  }
}

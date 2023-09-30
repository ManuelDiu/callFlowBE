import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne, ManyToMany } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { TribunalLlamado } from '../tribunalLlamado/tribunalLlamado.entity';
import { Cargo } from '../cargo/cargo.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { EstadoPosibleLlamado } from '../estadoLlamado/estadoLlamado.entity';
import { Disponibilidad } from '../disponibilidad/disponibilidad.entity';
import { Categoria } from '../categoria/categoria.entity';
import { Etapa } from '../etapa/etapa.entity';

@Entity('template', { orderBy: { id: 'DESC' } })
export class Template extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  @Unique(["nombre"])
  nombre: string;

  @Column({ length: 100, nullable: false })
  color: string;

  @Column({ nullable: false, default: true })
  activo: boolean;

  @OneToMany(() => Etapa, (e) => e.template)
  etapa: Etapa[];

  @ManyToOne(() => Cargo, (e) => e.templates)
  cargo: Cargo;


  toJSON() {
    delete this.id;
    return this;
  }
}

import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { Template } from '../template/template.entity';

@Entity('cargo', { orderBy: { id: 'DESC' } })
export class Cargo extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  @Unique(['nombre'])
  nombre: string;

  @Column({ length: 1000, nullable: false })
  tips: string;

  @OneToMany(() => Llamado, (llamado) => llamado.cargo)
  llamados: Llamado[];

  @OneToMany(() => Template, (llamado) => llamado.cargo)
  templates: Template[];

  toJSON() {
    return this;
  }

}

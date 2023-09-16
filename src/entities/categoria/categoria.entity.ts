import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';

@Entity('categoria', { orderBy: { id: 'DESC' } })
export class Categoria extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @ManyToMany(() => Llamado, (llamado) => llamado.categorias)
  llamados: Llamado[];

  toJSON() {
    return this;
  }

}

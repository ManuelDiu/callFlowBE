import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { EstadoLlamadoEnum } from '../../enums/EstadoLlamadoEnum';

@Entity('estadoPosibleLlamado', { orderBy: { id: 'DESC' } })
export class EstadoPosibleLlamado extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({
    type: "enum",
    enum: EstadoLlamadoEnum,
  })
  @Unique(["nombre"])
  nombre: EstadoLlamadoEnum;

  @OneToMany(() => Llamado, (llamado) => llamado.estadoActual)
  llamados: Llamado[];

  toJSON() {
    return this;
  }
}

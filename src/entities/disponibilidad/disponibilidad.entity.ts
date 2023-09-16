import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';

@Entity('disponibilidad', { orderBy: { id: 'DESC' } })
export class Disponibilidad extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  fecha: Date;

  @Column()
  horaMin: string;

  @Column()
  horaMax: string;

  @ManyToOne(() => Llamado, (llamado) => llamado.disponibilidad)
  llamado: Llamado;


  toJSON() {
    delete this.id;
    return this;
  }
}

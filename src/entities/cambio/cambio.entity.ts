import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { EstadoPostulanteEnum } from '../../enums/EstadoPostulanteEnum';
import { HistorialItem } from 'entities/historialitem/historialitem.entity';

@Entity('cambio', { orderBy: { id: 'DESC' } })
export class Cambio extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ nullable: true})
  cambio: boolean;

  @Column({
    type: "enum",
    enum: EstadoPostulanteEnum,
  })
  nombre: EstadoPostulanteEnum;

  @ManyToOne(() => PostulanteLlamado, (e) => e.cambios)
  postulante: PostulanteLlamado;

  @OneToMany(() => HistorialItem, (e) => e.cambio)
  @JoinColumn()
  cambioItem: HistorialItem;
  
  toJSON() {
    return this;
  }

}

import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { Postulante } from '../postulante/postulante.entity';
import { EstadoPostulante } from '../estadoPostulante/estadoPostulante.entity';
import { Puntaje } from '../puntaje/puntaje.entity';
import { Etapa } from '../etapa/etapa.entity';
import { Cambio } from '../cambio/cambio.entity';
import { Archivo } from '../archivo/archivo.entity';

@Entity('postLlamado', { orderBy: { id: 'DESC' } })
export class PostulanteLlamado extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
 
  @ManyToOne(() => EstadoPostulante, (estadopost) => estadopost.postulantes)
  estadoActual: EstadoPostulante;

  @ManyToOne(() => Postulante, (postulante) => postulante.llamados)
  postulante: Postulante;

  @ManyToOne(() => Llamado, (llamado) => llamado.postulantes)
  llamado: Llamado;

  @OneToMany(() => Puntaje, (a) => a.postulante)
  puntajes: Puntaje[];

  @ManyToOne(() => Etapa, (e) => e.postulantes)
  etapa: Etapa;

  @OneToMany(() => Cambio, (e) => e.postulante)
  cambios: Cambio[];
  
  @Column({ length: 1000, nullable: true, default: "" })
  descripcion: string;

  @OneToMany(() => Archivo, (a) => a.postulante)
  archivos: Archivo[];

  toJSON() {
    return this;
  }

}

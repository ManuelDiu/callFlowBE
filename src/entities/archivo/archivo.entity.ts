import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { TipoArchivo } from '../tipoArchivo/tipoArchivo.entity';

@Entity('archivo', { orderBy: { id: 'DESC' } })
export class Archivo extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 1000, nullable: false })
  url: string;

  @ManyToOne(() => Llamado, (l) => l.archivos)
  llamado: Llamado;

  @ManyToOne(() => PostulanteLlamado, (l) => l.archivos)
  postulante: PostulanteLlamado;

  @ManyToOne(() => TipoArchivo, (l) => l.archivos)
  tipoArchivo: TipoArchivo;

  toJSON() {
    return this;
  }
}

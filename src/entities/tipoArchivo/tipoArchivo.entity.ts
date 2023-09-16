import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { TipoArchivoOrigen } from '../../enums/TipoArchivoOrigen';
import { Archivo } from '../archivo/archivo.entity';

@Entity('tipoArchivo', { orderBy: { id: 'DESC' } })
export class TipoArchivo extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({
    type: "enum",
    enum: TipoArchivoOrigen,
  })
  origen: TipoArchivoOrigen;

  @OneToMany(() => Archivo, (a) => a.tipoArchivo)
  archivos: Archivo[];

  toJSON() {
    return this;
  }
}

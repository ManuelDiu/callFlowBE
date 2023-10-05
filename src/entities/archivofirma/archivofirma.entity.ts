import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { TipoArchivo } from '../tipoArchivo/tipoArchivo.entity';
import { TipoArchivoFirma } from '../../enums/TipoArchivoFirma';
import { FirmaEstado } from '../firmaestado/firmaestado.entity';

@Entity('archivofirma', { orderBy: { id: 'DESC' } })
export class ArchivoFirma extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 1000, nullable: false })
  url: string;

  @Column({ length: 1000, nullable: false })
  urlOriginal: string;

  @Column({ length: 100, nullable: true })
  extension: string;

  @Column({
    type: 'enum',
    enum: TipoArchivoFirma,
  })
  tipoArchivoFirma: TipoArchivoFirma;

  @ManyToOne(() => Llamado, (l) => l.archivosFirma)
  llamado: Llamado;

  @OneToMany(() => FirmaEstado, (e) => e.archivoFirma)
  firmas: FirmaEstado[];

  toJSON() {
    return this;
  }
}

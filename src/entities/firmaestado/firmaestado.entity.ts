import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Llamado } from '../llamado/llamado.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { TipoArchivo } from '../tipoArchivo/tipoArchivo.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { ArchivoFirma } from '../archivofirma/archivofirma.entity';

@Entity('firmaestado', { orderBy: { id: 'DESC' } })
export class FirmaEstado extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ nullable: false })
  firmado: boolean;

  @ManyToOne(() => Usuario, (u) => u.firmas)
  usuario: Usuario;

  @ManyToOne(() => ArchivoFirma, (u) => u.firmas)
  archivoFirma: ArchivoFirma;

  toJSON() {
    return this;
  }
}

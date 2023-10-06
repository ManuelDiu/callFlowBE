import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Subetapa } from '../subetapa/subetapa.entity';
import { Template } from '../template/template.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { Llamado } from '../llamado/llamado.entity';
import { Cambio } from 'entities/cambio/cambio.entity';

@Entity('historialitem', { orderBy: { id: 'DESC' } })
export class HistorialItem extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 500, nullable: true })
  descripcion: string;

  @ManyToOne(() => Usuario, (e) => e.historiales)
  usuario: Usuario;

  @ManyToOne(() => Llamado, (e) => e.historiales)
  llamado: Llamado;

  @OneToOne(() => Cambio, (e) => e.cambioItem)
  @JoinColumn()
  cambio: Cambio;

  toJSON() {
    return this;
  }

}

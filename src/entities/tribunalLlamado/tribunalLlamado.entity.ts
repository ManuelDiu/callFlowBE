import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { TipoMiembro } from '../../enums/TipoMiembro';
import { Usuario } from '../usuarios/usuarios.entity';
import { Llamado } from '../llamado/llamado.entity';

@Entity('tribunal', { orderBy: { id: 'DESC' } })
export class TribunalLlamado extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
 
  @Column({ nullable: false })
  orden: number;

  @Column({ length: 500, nullable: true })
  motivoRenuncia: string;

  @Column({
    type: "enum",
    enum: TipoMiembro
  })
  tipoMiembro: TipoMiembro;

  @ManyToOne(() => Usuario, (usuario) => usuario.tribunales)
  usuario: Usuario;

  @ManyToOne(() => Llamado, (llamado) => llamado.miembrosTribunal)
  llamado: Llamado;

  toJSON() {
    return this;
  }

}

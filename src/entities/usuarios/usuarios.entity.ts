import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany, JoinTable, ManyToMany } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { ITR } from '../../../src/enums/ITR';
import { Roles } from '../roles/roles.entity';
import { TribunalLlamado } from '../tribunalLlamado/tribunalLlamado.entity';
import { HistorialItem } from '../historialitem/historialitem.entity';
import { FirmaEstado } from '../firmaestado/firmaestado.entity';

@Entity('usuario', { orderBy: { id: 'DESC' } })
export class Usuario extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  @Unique(['email'])
  email: string;

  @Column({ length: 100, nullable: false, select: true })
  password: string;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 255, nullable: true })
  lastName: string;

  @Column({ length: 500, nullable: true })
  biografia: string;

  @Column({ length: 1000, nullable: true })
  imageUrl: string;

  @Column({
    default: false,
  })
  activo: boolean;

  @Column({
    nullable: true,
  })
  telefono: string;

  @Column({
    type: "enum",
    enum: ITR,
    nullable: false,
   })
  itr: ITR;

  @ManyToMany(() => Roles, roles => roles.usuarios)
  @JoinTable()
  public roles: Roles[];

  @OneToMany(() => TribunalLlamado, (tribunal) => tribunal.usuario)
  tribunales: TribunalLlamado[]

  @OneToMany(() => HistorialItem, (e) => e.usuario)
  historiales: HistorialItem[];

  @OneToMany(() => FirmaEstado, (e) => e.usuario)
  firmas: FirmaEstado[];


  toJSON() {
    delete this.password;
    return this;
  }

}

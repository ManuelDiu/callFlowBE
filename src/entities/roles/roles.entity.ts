import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { User } from '../user/user.entity';
import { Usuario } from '../usuarios/usuarios.entity';

@Entity('roles', { orderBy: { id: 'DESC' } })
export class Roles extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  @Unique(['nombre'])
  nombre: string;

  @ManyToMany(() => Usuario, user => user.roles)
  @JoinTable()
  usuarios: Usuario[];

  toJSON() {
    delete this.id;
    return this;
  }
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { Subetapa } from '../subetapa/subetapa.entity';
import { Requisito } from '../requisito/requisito.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';

@Entity('puntaje', { orderBy: { id: 'DESC' } })
export class Puntaje extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column()
  valor: number;

  @ManyToOne(() => Requisito, (req) => req.allPuntajes)
  requisito: Requisito;

  @ManyToOne(() => PostulanteLlamado, (post) => post.puntajes)
  postulante: PostulanteLlamado;

  toJSON() {
    return this;
  }

}

import { Column, Entity, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne, ManyToMany } from 'typeorm';

// Entities
import { BaseEntity } from '../base/base.entity';
import { TribunalLlamado } from '../tribunalLlamado/tribunalLlamado.entity';
import { Cargo } from '../cargo/cargo.entity';
import { PostulanteLlamado } from '../postulanteLlamado/postulanteLlamado.entity';
import { EstadoPosibleLlamado } from '../estadoLlamado/estadoLlamado.entity';
import { Disponibilidad } from '../disponibilidad/disponibilidad.entity';
import { Categoria } from '../categoria/categoria.entity';
import { HistorialItem } from '../historialitem/historialitem.entity';
import { Archivo } from '../archivo/archivo.entity';
import { ArchivoFirma } from '../archivofirma/archivofirma.entity';
import { Etapa } from '../etapa/etapa.entity';

@Entity('llamado', { orderBy: { id: 'DESC' } })
export class Llamado extends BaseEntity {

  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ length: 100, nullable: false })
  nombre: string;

  @Column({ length: 100, nullable: false })
  @Unique(['referencia'])
  referencia: string;

  @Column()
  cantidadHoras: number;

  @Column()
  cupos: number;

  @Column()
  enviarEmailTodos: boolean;
  
  @ManyToOne(() => EstadoPosibleLlamado, (estado) => estado.llamados)
  estadoActual: EstadoPosibleLlamado;

  @OneToMany(() => Disponibilidad, (disp) => disp.llamado)
  disponibilidad: Disponibilidad[];

  @OneToMany(() => TribunalLlamado, (tribunal) => tribunal.llamado)
  miembrosTribunal: TribunalLlamado[];

  @ManyToOne(() => Cargo, (cargo) => cargo.llamados)
  cargo: Cargo;

  @OneToMany(() => PostulanteLlamado, (postLlamado) => postLlamado.llamado)
  postulantes: PostulanteLlamado[];

  @ManyToMany(() => Categoria, (cat) => cat.llamados)
  categorias: Categoria[];

  @OneToMany(() => HistorialItem, (e) => e.llamado)
  historiales: HistorialItem[];

  @OneToMany(() => Archivo, (e) => e.llamado)
  archivos: Archivo[];

  @OneToMany(() => ArchivoFirma, (e) => e.llamado)
  archivosFirma: ArchivoFirma[];

  @OneToMany(() => Etapa, (e) => e.llamado)
  etapas: Etapa[];

  toJSON() {
    delete this.id;
    return this;
  }
}

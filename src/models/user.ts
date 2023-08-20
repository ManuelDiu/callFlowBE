import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column()
  nombre: string = "";

  @Column({ unique: true })
  email: string = "";

  @Column()
  password: string = "";
}
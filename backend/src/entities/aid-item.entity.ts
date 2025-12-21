import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('aid_items')
export class AidItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  category: string;
}

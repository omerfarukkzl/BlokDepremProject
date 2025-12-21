import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { AidItem } from './aid-item.entity';

@Entity('needs')
export class Need {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  location_id: number;

  @Column()
  item_id: number;

  @Column()
  needed_quantity: number;

  @Column({ default: 0 })
  supplied_quantity: number;

  @Column({ nullable: true })
  priority: number;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => AidItem)
  @JoinColumn({ name: 'item_id' })
  item: AidItem;
}

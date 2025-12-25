import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Official } from './official.entity';
import { Shipment } from './shipment.entity';

@Entity('predictions')
export class Prediction {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    region_id: string;

    @Column('jsonb')
    predicted_quantities: Record<string, number>;
    // { tent: 150, container: 50, food_package: 1000, blanket: 500 }

    @Column('jsonb', { nullable: true })
    actual_quantities: Record<string, number> | null;

    @Column({ type: 'decimal', precision: 4, scale: 2 })
    confidence: number;

    @Column()
    prediction_hash: string;

    @Column({ type: 'varchar', nullable: true })
    blockchain_tx_hash: string | null;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        nullable: true,
        transformer: {
            to(data: number): number {
                return data;
            },
            from(data: string): number {
                return parseFloat(data);
            },
        },
    })
    accuracy: number | null;

    @Column({ type: 'int', nullable: true })
    created_by_official_id: number | null;

    @ManyToOne(() => Official, { nullable: true })
    @JoinColumn({ name: 'created_by_official_id' })
    official: Official | null;

    @Column({ type: 'int', nullable: true })
    shipment_id: number | null;

    @OneToOne(() => Shipment, (shipment) => shipment.prediction, { nullable: true })
    @JoinColumn({ name: 'shipment_id' })
    shipment: Shipment | null;

    @CreateDateColumn()
    created_at: Date;
}

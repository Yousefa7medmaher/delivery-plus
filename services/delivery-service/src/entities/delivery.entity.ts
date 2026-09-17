import { DeliveryStatus } from '@food-delivery/shared';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column()
  orderId!: string;

  @Index()
  @Column({ nullable: true })
  driverId?: string; // driver-service Driver.id (not the userId)

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.CREATED })
  status!: DeliveryStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

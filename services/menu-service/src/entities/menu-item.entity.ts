import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  restaurantId!: string;

  @Index()
  @Column({ nullable: true })
  categoryId?: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: string; // stored as string by TypeORM for `decimal` to avoid float rounding

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  available!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import { UserRole } from '@food-delivery/shared';
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('credentials')
export class Credential {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // also used as the canonical userId across services

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role!: UserRole;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lockedUntil!: Date | null;

  @Column({ default: 0 })
  failedLoginCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastFailedLoginAt!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  verificationTokenHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  verificationTokenExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

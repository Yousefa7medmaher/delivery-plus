import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../entities/credential.entity';

@Injectable()
export class CredentialsRepository {
  constructor(
    @InjectRepository(Credential)
    private readonly repo: Repository<Credential>,
  ) {}

  findByEmail(email: string): Promise<Credential | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<Credential | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(
    data: Pick<
      Credential,
      | 'email'
      | 'passwordHash'
      | 'role'
      | 'emailVerified'
      | 'failedLoginCount'
      | 'lockedUntil'
      | 'lastFailedLoginAt'
      | 'verificationTokenHash'
      | 'verificationTokenExpiresAt'
    >,
  ): Promise<Credential> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Credential>): Promise<Credential | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}

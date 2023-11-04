import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import ormConfig from '../../database/mikro-orm-app.config';
import AtmEntity from './atm/atm.entity';
import { AtmRepositoryProvider } from './atm/atm.repository';

@Global()
@Module({
  imports: [MikroOrmModule.forRoot(ormConfig), MikroOrmModule.forFeature([AtmEntity])],
  providers: [AtmRepositoryProvider],
  exports: [AtmRepositoryProvider],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.orm.getMigrator().up();
    } else {
      await this.orm.getSchemaGenerator().updateSchema();
    }
  }
}

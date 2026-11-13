import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import ormConfig from '../../database/mikro-orm-app.config';
import InboxEntity from './inbox/inbox.entity';
import { InboxProvider } from './inbox/inbox.repository';
import HeadOfficeEntity from './management/head-office.entity';
import { HeadOfficeRepositoryProvider } from './management/head-office.repository';

@Global()
@Module({
  imports: [
    MikroOrmModule.forRoot({ ...ormConfig, autoLoadEntities: true }),
    MikroOrmModule.forFeature([HeadOfficeEntity, InboxEntity]),
  ],
  providers: [HeadOfficeRepositoryProvider, InboxProvider],
  exports: [HeadOfficeRepositoryProvider, InboxProvider],
})
export class DatabaseModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.orm.migrator.up();
    } else {
      await this.orm.schema.update();
    }
  }
}

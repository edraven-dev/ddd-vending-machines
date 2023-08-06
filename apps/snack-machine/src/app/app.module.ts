import { MikroORM } from '@mikro-orm/core';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import ormConfig from '../database/mikro-orm-app.config';
import { SnackMachineModule } from './snack-machine/snack-machine.module';

@Module({
  imports: [MikroOrmModule.forRoot(ormConfig), SnackMachineModule],
  providers: [{ provide: APP_PIPE, useValue: new ValidationPipe({ transform: true, whitelist: true }) }],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      await this.orm.getSchemaGenerator().updateSchema();
    } else {
      await this.orm.getMigrator().up();
    }
  }
}

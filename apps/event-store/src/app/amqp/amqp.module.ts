import { DynamicModule, Module } from '@nestjs/common';
import type { ConnectionUrl } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { CONFIG_OPTIONS_TOKEN } from '../constants';
import { AmqpService } from './amqp.service';

export type AmqpConfig = ConnectionUrl;

@Module({})
export class AmqpModule {
  static forRoot(config: AmqpConfig): DynamicModule {
    return {
      module: AmqpModule,
      providers: [{ provide: CONFIG_OPTIONS_TOKEN, useValue: config }, AmqpService],
      exports: [AmqpService],
    };
  }
}

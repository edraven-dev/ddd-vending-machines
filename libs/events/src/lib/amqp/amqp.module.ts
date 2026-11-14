import { DynamicModule, Module } from '@nestjs/common';
import type { ConnectionUrl } from 'amqp-connection-manager';
import { CONFIG_OPTIONS_TOKEN } from '../constants';
import { AmqpService } from './amqp.service';

export type AmqpConfig = ConnectionUrl;

const DEFAULT_RABBITMQ_URL = 'amqp://rabbitmq:rabbitmq@localhost:5672';

@Module({})
export class AmqpModule {
  static forRoot(config: AmqpConfig = { url: process.env['RABBITMQ_URL'] || DEFAULT_RABBITMQ_URL }): DynamicModule {
    return {
      module: AmqpModule,
      global: true,
      providers: [{ provide: CONFIG_OPTIONS_TOKEN, useValue: config }, AmqpService],
      exports: [AmqpService],
    };
  }
}

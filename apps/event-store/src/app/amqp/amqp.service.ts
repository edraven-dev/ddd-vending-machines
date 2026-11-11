import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { connect } from 'amqp-connection-manager';
import type { AmqpConnectionManager, Channel, ChannelWrapper } from 'amqp-connection-manager';
import { CONFIG_OPTIONS_TOKEN } from '../constants';
import type { AmqpConfig } from './amqp.module';

@Injectable()
export class AmqpService implements OnModuleInit, OnApplicationShutdown {
  private readonly deliveryLimit = 10;
  private readonly nackDelay = 1000;

  public connection: AmqpConnectionManager | undefined;
  public channelWrapper: ChannelWrapper | undefined;

  constructor(@Inject(CONFIG_OPTIONS_TOKEN) private readonly config: AmqpConfig) {}

  onModuleInit() {
    this.connection = connect(this.config);
    this.connection.on('connectFailed', ({ url }) =>
      Logger.error(
        `AMQP connection to ${typeof url === 'string' ? url : JSON.stringify(url)} failed. Trying again...`,
        this.constructor.name,
      ),
    );
    this.connection.on('connect', () => Logger.debug('AMQP connected', this.constructor.name));
    this.connection.on('disconnect', ({ err }) => Logger.error(`AMQP disconnected`, err?.stack, this.constructor.name));
    this.connection.on('blocked', ({ reason }) => Logger.error(`AMQP blocked ${reason}`, this.constructor.name));
    this.connection.on('unblocked', () => Logger.debug('AMQP unblocked', this.constructor.name));
    this.connection.on('error', (err) => Logger.error(err, this.constructor.name));
    this.channelWrapper = this.connection.createChannel({ json: false });
    this.channelWrapper.on('connect', () => Logger.debug('AMQP channel created', this.constructor.name));
    this.channelWrapper.on('close', () => Logger.debug('AMQP channel closed', this.constructor.name));
    this.channelWrapper.on('error', (err) => Logger.error(err, this.constructor.name));
  }

  async onApplicationShutdown() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }

  async addSubscriber(
    exchangeName: string,
    routingKey: string,
    queueName: string,
    consumer: (msg: Buffer) => Promise<void> | void,
  ): Promise<void> {
    const channelWrapper = this.channelWrapper;
    if (!channelWrapper) {
      throw new Error('AmqpService.addSubscriber() called before onModuleInit()');
    }
    await channelWrapper.addSetup((channel: Channel) => {
      return Promise.all([
        channel.assertExchange(exchangeName, 'topic', { durable: true }),
        channel.assertQueue(queueName, {
          durable: true,
          arguments: {
            'x-queue-type': 'quorum',
            'x-delivery-limit': this.deliveryLimit,
            'x-overflow': 'drop-head',
          },
        }),
        channel.bindQueue(queueName, exchangeName, routingKey),
        channel.consume(queueName, async (msg) => {
          if (!msg) {
            return;
          }
          try {
            await consumer(msg.content);
            channelWrapper.ack(msg);
          } catch (error) {
            Logger.error(error, `${this.constructor.name}|${exchangeName}|${queueName}`);
            setTimeout(() => channelWrapper.nack(msg), this.nackDelay);
          }
        }),
      ]);
    });
  }
}

import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Channel, ChannelWrapper, connect } from 'amqp-connection-manager';
import type { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { PublishOptions } from 'amqp-connection-manager/dist/types/ChannelWrapper';
import { randomUUID } from 'crypto';
import { CONFIG_OPTIONS_TOKEN } from '../constants';
import { AmqpConfig } from './amqp.module';

@Injectable()
export class AmqpService implements OnModuleInit, OnApplicationShutdown {
  private readonly deliveryLimit = 10;
  private readonly nackDelay = 1000;

  public connection: IAmqpConnectionManager | undefined;
  public channelWrapper: ChannelWrapper | undefined;

  constructor(@Inject(CONFIG_OPTIONS_TOKEN) private readonly config: AmqpConfig) {}

  onModuleInit() {
    this.connection = connect(this.config);
    this.connection.on('connectFailed', ({ url }) =>
      Logger.error(`AMQP connection to ${url} failed. Trying again...`, this.constructor.name),
    );
    this.connection.on('connect', () => Logger.debug('AMQP connected', this.constructor.name));
    this.connection.on('disconnect', ({ err }) => Logger.error(`AMQP disconnected`, err.stack, this.constructor.name));
    this.connection.on('blocked', ({ reason }) => Logger.error(`AMQP blocked ${reason}`, this.constructor.name));
    this.connection.on('unblocked', () => Logger.debug('AMQP unblocked', this.constructor.name));
    this.connection.on('error', (err) =>
      Logger.error((err as Error)?.message, (err as Error)?.stack, this.constructor.name),
    );
    this.channelWrapper = this.connection.createChannel({ json: false });
    this.channelWrapper.on('connect', () => Logger.debug('AMQP channel created', this.constructor.name));
    this.channelWrapper.on('close', () => Logger.debug('AMQP channel closed', this.constructor.name));
    this.channelWrapper.on('error', (err) => Logger.error(err.message, err.stack, this.constructor.name));
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
    await this.channelWrapper?.addSetup((channel: Channel) => {
      const dlxExchangeName = `${exchangeName}.dlx`;
      const dlxQueueName = `${queueName}.dlx`;
      const dlxRoutingKey = dlxQueueName.split('.').slice(1).join('.');
      return Promise.all([
        channel.assertExchange(exchangeName, 'topic', { durable: true }),
        channel.assertExchange(dlxExchangeName, 'direct', { durable: true }),
        channel.assertQueue(queueName, {
          durable: true,
          deadLetterExchange: dlxExchangeName,
          arguments: {
            'x-queue-type': 'quorum',
            'x-delivery-limit': this.deliveryLimit,
            'x-overflow': 'reject-publish',
            'x-dead-letter-routing-key': dlxRoutingKey,
          },
        }),
        channel.assertQueue(dlxQueueName, {
          durable: true,
          arguments: { 'x-queue-type': 'quorum', 'x-overflow': 'drop-head' },
        }),
        channel.bindQueue(queueName, exchangeName, routingKey),
        channel.bindQueue(dlxQueueName, dlxExchangeName, dlxRoutingKey),
        channel.consume(queueName, async (msg) => {
          if (!msg) {
            return;
          }
          try {
            await consumer(msg.content);
            this.channelWrapper!.ack(msg);
          } catch (error) {
            Logger.error(
              (error as Error).message,
              (error as Error).stack,
              `${this.constructor.name}|${exchangeName}|${queueName}`,
            );
            setTimeout(() => this.channelWrapper!.nack(msg), this.nackDelay);
          }
        }),
      ]);
    });
  }

  async publish(exchangeName: string, routingKey: string, content: string, options?: PublishOptions): Promise<void> {
    await this.channelWrapper?.publish(exchangeName, routingKey, Buffer.from(content), {
      messageId: randomUUID(),
      ...options,
    });
  }
}

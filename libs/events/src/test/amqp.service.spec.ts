import { Logger } from '@nestjs/common';
import type { Channel, ChannelWrapper } from 'amqp-connection-manager';
import type { ConsumeMessage, MessageProperties } from 'amqplib';
import { AmqpService } from '../lib/amqp/amqp.service';

const { channel, channelWrapper } = vi.hoisted(() => {
  const channel = {
    assertExchange: vi.fn<Channel['assertExchange']>(),
    assertQueue: vi.fn<Channel['assertQueue']>(),
    bindQueue: vi.fn<Channel['bindQueue']>(),
    consume: vi.fn<Channel['consume']>(),
  };
  return {
    channel,
    channelWrapper: {
      on: vi.fn<() => void>(),
      ack: vi.fn<ChannelWrapper['ack']>(),
      nack: vi.fn<ChannelWrapper['nack']>(),
      addSetup: (setup: (setupChannel: typeof channel) => Promise<unknown>) => setup(channel),
    },
  };
});

vi.mock('amqp-connection-manager', () => ({
  connect: () => ({ on: vi.fn<() => void>(), createChannel: () => channelWrapper }),
}));

const aMessage = (properties: Partial<MessageProperties> = {}): ConsumeMessage => ({
  content: Buffer.from('ping'),
  fields: { deliveryTag: 1, redelivered: false, exchange: '', routingKey: 'q.test', consumerTag: 'consumer' },
  properties: {
    contentType: undefined,
    contentEncoding: undefined,
    headers: undefined,
    deliveryMode: undefined,
    priority: undefined,
    correlationId: undefined,
    replyTo: undefined,
    expiration: undefined,
    messageId: undefined,
    timestamp: undefined,
    type: undefined,
    userId: undefined,
    appId: undefined,
    clusterId: undefined,
    ...properties,
  },
});

describe('AmqpService', () => {
  const service = new AmqpService('amqp://unused');

  beforeAll(() => {
    service.onModuleInit();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('#addSubscriber', () => {
    const consumer = vi.fn<(msg: Buffer) => Promise<void>>(async () => undefined);
    let onMessage: Parameters<Channel['consume']>[1] | undefined;

    beforeAll(async () => {
      await service.addSubscriber('ex.test', 'event.#', 'q.test', consumer);
      onMessage = channel.consume.mock.lastCall?.[1];
    });

    it('should acknowledge a consumed message', async () => {
      const message = aMessage();

      onMessage?.(message);

      await vi.waitFor(() => expect(channelWrapper.ack).toHaveBeenCalledWith(message));
      expect(consumer).toHaveBeenCalledWith(message.content);
    });

    it.each([
      ['the first attempt', aMessage()],
      ['the ninth attempt', aMessage({ headers: { 'x-acquired-count': 8 } })],
    ])('should requeue a message that fails on %s', async (_attempt, message) => {
      vi.useFakeTimers();
      vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      consumer.mockRejectedValueOnce(new Error('database unavailable'));

      onMessage?.(message);
      await vi.advanceTimersByTimeAsync(1000);

      expect(channelWrapper.nack).toHaveBeenCalledWith(message, false, true);
    });

    it('should dead-letter a message that fails on the tenth attempt', async () => {
      vi.useFakeTimers();
      vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      consumer.mockRejectedValueOnce(new Error('malformed event'));
      const message = aMessage({ headers: { 'x-acquired-count': 9 } });

      onMessage?.(message);
      await vi.advanceTimersByTimeAsync(1000);

      expect(channelWrapper.nack).toHaveBeenCalledWith(message, false, false);
    });
  });
});

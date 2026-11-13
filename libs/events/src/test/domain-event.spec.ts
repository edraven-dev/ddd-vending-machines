import { Id } from '@vending-machines/shared';
import { BalanceChangedEvent } from '../event-declarations';
import { AggregateType } from '../lib/aggregate-type';

describe('DomainEvent', () => {
  const anEvent = (aggregateId = Id.generate()) =>
    new BalanceChangedEvent({ aggregateId, aggregateType: AggregateType.Atm, payload: { delta: '0.01' } });

  it("should carry an aggregate's Id as its UUID string", () => {
    const aggregateId = Id.generate();

    expect(anEvent(aggregateId).aggregateId).toBe(aggregateId.value);
  });

  it('should get a unique version 7 event id', () => {
    const first = anEvent();
    const second = anEvent();

    expect(first.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(first.eventId).not.toBe(second.eventId);
  });

  it('should be named after its class and timestamped', () => {
    const event = anEvent();

    expect(event.eventType).toBe('BalanceChangedEvent');
    expect(event.timestamp).toBeInstanceOf(Date);
  });
});

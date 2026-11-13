import { NestFactory } from '@nestjs/core';
import { CqrsModule, EventPublisher, type IEvent } from '@nestjs/cqrs';
import { AggregateRoot } from '../lib/aggregate-root';
import { Entity } from '../lib/entity';
import { Id } from '../lib/id';

class TestEntity extends Entity {}
class OtherEntity extends Entity {}
class TestAggregate extends AggregateRoot {}
class OtherAggregate extends AggregateRoot {}

const uuid = '019a7f3e-8c41-7d2a-b5e6-3f9d1c2b4a60';
const otherUuid = '019a7f3e-8c41-7d2a-b5e6-3f9d1c2b4a61';

describe('Entity', () => {
  it('should equal itself', () => {
    const entity = new TestEntity(Id.from(uuid));

    expect(entity.equals(entity)).toBe(true);
  });

  it('should equal another instance of the same class with an equal id', () => {
    expect(new TestEntity(Id.from(uuid)).equals(new TestEntity(Id.from(uuid)))).toBe(true);
  });

  it('should not equal an instance with another id', () => {
    expect(new TestEntity(Id.from(uuid)).equals(new TestEntity(Id.from(otherUuid)))).toBe(false);
  });

  it('should not equal an instance of another class with an equal id, in either direction', () => {
    expect(new TestEntity(Id.from(uuid)).equals(new OtherEntity(Id.from(uuid)))).toBe(false);
    expect(new OtherEntity(Id.from(uuid)).equals(new TestEntity(Id.from(uuid)))).toBe(false);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['its bare UUID', uuid],
    ['its Id', Id.from(uuid)],
    ['a plain object with its id', { id: Id.from(uuid) }],
  ])('should not equal %s', (_name, other) => {
    expect(new TestEntity(Id.from(uuid)).equals(other)).toBe(false);
  });
});

describe('AggregateRoot', () => {
  it('should be an Entity', () => {
    expect(new TestAggregate(Id.from(uuid))).toBeInstanceOf(Entity);
  });

  it('should be usable as a type', () => {
    const id = Id.from(uuid);
    const aggregate: AggregateRoot = new TestAggregate(id);

    expect(aggregate.id).toBe(id);
  });

  it('should equal itself', () => {
    const aggregate = new TestAggregate(Id.from(uuid));

    expect(aggregate.equals(aggregate)).toBe(true);
  });

  it('should equal another instance of the same class with an equal id', () => {
    expect(new TestAggregate(Id.from(uuid)).equals(new TestAggregate(Id.from(uuid)))).toBe(true);
  });

  it('should not equal another aggregate type with an equal id, in either direction', () => {
    expect(new TestAggregate(Id.from(uuid)).equals(new OtherAggregate(Id.from(uuid)))).toBe(false);
    expect(new OtherAggregate(Id.from(uuid)).equals(new TestAggregate(Id.from(uuid)))).toBe(false);
  });

  it('should not equal an entity with an equal id, in either direction', () => {
    expect(new TestAggregate(Id.from(uuid)).equals(new TestEntity(Id.from(uuid)))).toBe(false);
    expect(new TestEntity(Id.from(uuid)).equals(new TestAggregate(Id.from(uuid)))).toBe(false);
  });

  it('should still equal an instance of the same class after merging the event publisher', async () => {
    const app = await NestFactory.createApplicationContext(CqrsModule, { logger: false });
    const merged = app.get(EventPublisher).mergeObjectContext(new TestAggregate(Id.from(uuid)));

    expect(merged.equals(new TestAggregate(Id.from(uuid)))).toBe(true);
    expect(new TestAggregate(Id.from(uuid)).equals(merged)).toBe(true);

    await app.close();
  });

  describe('#commit', () => {
    it('should return a promise even without an event publisher', async () => {
      const committing = new TestAggregate(Id.generate()).commit();

      expect(committing).toBeInstanceOf(Promise);
      await committing;
    });

    it('should wait for the event publisher', async () => {
      const aggregate = new TestAggregate(Id.generate());
      const event = { name: 'TestEvent' };
      const published: IEvent[] = [];
      aggregate.publishAll = async (events) => {
        const batch = [...events];
        await new Promise((resolve) => setTimeout(resolve, 0));
        published.push(...batch);
      };
      aggregate.apply(event);

      await aggregate.commit();

      expect(published).toEqual([event]);
    });

    it('should reject when publishing fails', async () => {
      const aggregate = new TestAggregate(Id.generate());
      aggregate.publishAll = () => Promise.reject(new Error('Broker unavailable'));
      aggregate.apply({ name: 'TestEvent' });

      await expect(aggregate.commit()).rejects.toThrow('Broker unavailable');
    });
  });
});

import { NestFactory } from '@nestjs/core';
import { CqrsModule, EventPublisher } from '@nestjs/cqrs';
import { AggregateRoot } from '../lib/aggregate-root';
import { Entity } from '../lib/entity';

class TestEntity extends Entity {}
class OtherEntity extends Entity {}
class TestAggregate extends AggregateRoot {}
class OtherAggregate extends AggregateRoot {}

const id = 'ad277203-e35d-4ffe-a03f-6630ea3302cc';
const otherId = '2551785a-6b0d-4069-bf51-e60fc76588fd';

describe('Entity', () => {
  it('should equal itself', () => {
    const entity = new TestEntity(id);

    expect(entity.equals(entity)).toBe(true);
  });

  it('should equal another instance of the same class with the same id', () => {
    expect(new TestEntity(id).equals(new TestEntity(id))).toBe(true);
  });

  it('should not equal an instance with another id', () => {
    expect(new TestEntity(id).equals(new TestEntity(otherId))).toBe(false);
  });

  it('should not equal an instance of another class with the same id, in either direction', () => {
    expect(new TestEntity(id).equals(new OtherEntity(id))).toBe(false);
    expect(new OtherEntity(id).equals(new TestEntity(id))).toBe(false);
  });

  it.each([null, undefined, id, { id }])('should not equal %o', (other) => {
    expect(new TestEntity(id).equals(other)).toBe(false);
  });
});

describe('AggregateRoot', () => {
  it('should be an Entity', () => {
    expect(new TestAggregate(id)).toBeInstanceOf(Entity);
  });

  it('should be usable as a type', () => {
    const aggregate: AggregateRoot = new TestAggregate(id);

    expect(aggregate.id).toBe(id);
  });

  it('should equal itself', () => {
    const aggregate = new TestAggregate(id);

    expect(aggregate.equals(aggregate)).toBe(true);
  });

  it('should equal another instance of the same class with the same id', () => {
    expect(new TestAggregate(id).equals(new TestAggregate(id))).toBe(true);
  });

  it('should not equal another aggregate type with the same id, in either direction', () => {
    expect(new TestAggregate(id).equals(new OtherAggregate(id))).toBe(false);
    expect(new OtherAggregate(id).equals(new TestAggregate(id))).toBe(false);
  });

  it('should not equal an entity with the same id, in either direction', () => {
    expect(new TestAggregate(id).equals(new TestEntity(id))).toBe(false);
    expect(new TestEntity(id).equals(new TestAggregate(id))).toBe(false);
  });

  it('should still equal an instance of the same class after merging the event publisher', async () => {
    const app = await NestFactory.createApplicationContext(CqrsModule, { logger: false });
    const merged = app.get(EventPublisher).mergeObjectContext(new TestAggregate(id));

    expect(merged.equals(new TestAggregate(id))).toBe(true);
    expect(new TestAggregate(id).equals(merged)).toBe(true);

    await app.close();
  });
});

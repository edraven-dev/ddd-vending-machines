import { BaseEntity, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'event_store' })
export default class EventStoreEntity extends BaseEntity<EventStoreEntity, 'event_id'> {
  @PrimaryKey({ type: 'uuid' })
  event_id!: string;

  @Property({ type: 'varchar', length: 255 })
  event_type!: string;

  @Property({ type: 'uuid' })
  aggregate_id!: string;

  @Property({ type: 'varchar', length: 255 })
  aggregate_type!: string;

  @Property({ type: 'jsonb' })
  payload!: unknown;

  @Property({ type: 'timestamp with time zone', defaultRaw: 'CURRENT_TIMESTAMP' })
  timestamp: Date = new Date();
}

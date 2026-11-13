import { type Opt, PrimaryKeyProp } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

@Entity({ tableName: 'inbox' })
export default class InboxEntity {
  [PrimaryKeyProp]?: ['consumer', 'eventId'];

  @PrimaryKey({ type: 'varchar', length: 255 })
  consumer!: string;

  @PrimaryKey({ type: 'uuid' })
  eventId!: string;

  @Property({ type: 'timestamptz', defaultRaw: 'current_timestamp' })
  processedAt!: Opt<Date>;
}

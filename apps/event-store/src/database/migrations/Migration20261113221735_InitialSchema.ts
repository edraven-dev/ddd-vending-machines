import { Migration } from '@mikro-orm/migrations';

export class Migration20261113221735_InitialSchema extends Migration {

  override name = 'Migration20261113221735_InitialSchema';

  override up(): void | Promise<void> {
    this.addSql(`create table "event_store" ("event_id" uuid not null, "event_type" varchar(255) not null, "aggregate_id" uuid not null, "aggregate_type" varchar(255) not null, "payload" jsonb not null, "timestamp" timestamptz not null default CURRENT_TIMESTAMP, primary key ("event_id"));`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20231227161724_AddEventStoreEntity extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "event_store" ("event_id" uuid not null, "event_type" varchar(255) not null, "aggregate_id" uuid not null, "aggregate_type" varchar(255) not null, "payload" jsonb not null, "timestamp" timestamptz(0) not null default CURRENT_TIMESTAMP, constraint "event_store_pkey" primary key ("event_id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "event_store" cascade;');
  }

}

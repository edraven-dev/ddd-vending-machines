import { Migration } from '@mikro-orm/migrations';

export class Migration20261113181143_AddInbox extends Migration {

  override name = 'Migration20261113181143_AddInbox';

  override up(): void | Promise<void> {
    this.addSql(`create table "inbox" ("consumer" varchar(255) not null, "event_id" uuid not null, "processed_at" timestamptz not null default current_timestamp, primary key ("consumer", "event_id"));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "inbox" cascade;`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20261113221732_InitialSchema extends Migration {

  override name = 'Migration20261113221732_InitialSchema';

  override up(): void | Promise<void> {
    this.addSql(`create table "head_office" ("id" uuid not null, "balance" numeric(18,2) not null, "cash_one_cent_count" int not null, "cash_ten_cent_count" int not null, "cash_quarter_count" int not null, "cash_one_dollar_count" int not null, "cash_five_dollar_count" int not null, "cash_twenty_dollar_count" int not null, "expires_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`create index "head_office_expires_at_index" on "head_office" ("expires_at");`);

    this.addSql(`create table "head_office_atm" ("atm_id" uuid not null, "head_office_id" uuid not null, primary key ("atm_id"));`);
    this.addSql(`create index "head_office_atm_head_office_id_index" on "head_office_atm" ("head_office_id");`);

    this.addSql(`create table "head_office_snack_machine" ("snack_machine_id" uuid not null, "head_office_id" uuid not null, primary key ("snack_machine_id"));`);
    this.addSql(`create index "head_office_snack_machine_head_office_id_index" on "head_office_snack_machine" ("head_office_id");`);

    this.addSql(`create table "inbox" ("consumer" varchar(255) not null, "event_id" uuid not null, "processed_at" timestamptz not null default current_timestamp, primary key ("consumer", "event_id"));`);

    this.addSql(`alter table "head_office_atm" add constraint "head_office_atm_head_office_id_foreign" foreign key ("head_office_id") references "head_office" ("id") on delete cascade;`);

    this.addSql(`alter table "head_office_snack_machine" add constraint "head_office_snack_machine_head_office_id_foreign" foreign key ("head_office_id") references "head_office" ("id") on delete cascade;`);
  }

}

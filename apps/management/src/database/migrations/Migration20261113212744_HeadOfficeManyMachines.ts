import { Migration } from '@mikro-orm/migrations';

export class Migration20261113212744_HeadOfficeManyMachines extends Migration {

  override name = 'Migration20261113212744_HeadOfficeManyMachines';

  override up(): void | Promise<void> {
    this.addSql(`create table "head_office_atm" ("atm_id" uuid not null, "head_office_id" uuid not null, primary key ("atm_id"));`);
    this.addSql(`create index "head_office_atm_head_office_id_index" on "head_office_atm" ("head_office_id");`);

    this.addSql(`create table "head_office_snack_machine" ("snack_machine_id" uuid not null, "head_office_id" uuid not null, primary key ("snack_machine_id"));`);
    this.addSql(`create index "head_office_snack_machine_head_office_id_index" on "head_office_snack_machine" ("head_office_id");`);

    this.addSql(`insert into "head_office_atm" ("atm_id", "head_office_id") select "atm_id", "id" from "head_office";`);
    this.addSql(`insert into "head_office_snack_machine" ("snack_machine_id", "head_office_id") select "snack_machine_id", "id" from "head_office";`);

    this.addSql(`alter table "head_office" drop constraint "head_office_atm_id_unique";`);
    this.addSql(`alter table "head_office" drop constraint "head_office_snack_machine_id_unique";`);
    this.addSql(`alter table "head_office" drop column "atm_id", drop column "snack_machine_id";`);

    this.addSql(`alter table "head_office_atm" add constraint "head_office_atm_head_office_id_foreign" foreign key ("head_office_id") references "head_office" ("id") on delete cascade;`);

    this.addSql(`alter table "head_office_snack_machine" add constraint "head_office_snack_machine_head_office_id_foreign" foreign key ("head_office_id") references "head_office" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "head_office_atm" cascade;`);
    this.addSql(`drop table if exists "head_office_snack_machine" cascade;`);

    this.addSql(`alter table "head_office" add "atm_id" uuid not null, add "snack_machine_id" uuid not null;`);
    this.addSql(`alter table "head_office" add constraint "head_office_atm_id_unique" unique ("atm_id");`);
    this.addSql(`alter table "head_office" add constraint "head_office_snack_machine_id_unique" unique ("snack_machine_id");`);
  }

}

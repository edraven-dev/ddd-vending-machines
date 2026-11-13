import { Migration } from '@mikro-orm/migrations';

export class Migration20261113205947_AddHeadOfficeLifecycle extends Migration {

  override name = 'Migration20261113205947_AddHeadOfficeLifecycle';

  override up(): void | Promise<void> {
    this.addSql(`delete from "head_office";`);
    this.addSql(`alter table "head_office" add "atm_id" uuid not null, add "snack_machine_id" uuid not null, add "expires_at" timestamptz not null;`);
    this.addSql(`alter table "head_office" add constraint "head_office_atm_id_unique" unique ("atm_id");`);
    this.addSql(`alter table "head_office" add constraint "head_office_snack_machine_id_unique" unique ("snack_machine_id");`);
    this.addSql(`create index "head_office_expires_at_index" on "head_office" ("expires_at");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "head_office" drop constraint "head_office_atm_id_unique";`);
    this.addSql(`alter table "head_office" drop constraint "head_office_snack_machine_id_unique";`);
    this.addSql(`drop index "head_office_expires_at_index";`);
    this.addSql(`alter table "head_office" drop column "atm_id", drop column "snack_machine_id", drop column "expires_at";`);
  }

}

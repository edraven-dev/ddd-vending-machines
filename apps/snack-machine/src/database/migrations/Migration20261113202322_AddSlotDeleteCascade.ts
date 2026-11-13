import { Migration } from '@mikro-orm/migrations';

export class Migration20261113202322_AddSlotDeleteCascade extends Migration {

  override name = 'Migration20261113202322_AddSlotDeleteCascade';

  override up(): void | Promise<void> {
    this.addSql(`alter table "slot" drop constraint "slot_snack_machine_id_foreign";`);

    this.addSql(`alter table "slot" add constraint "slot_snack_machine_id_foreign" foreign key ("snack_machine_id") references "snack_machine" ("id") on update cascade on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "slot" drop constraint "slot_snack_machine_id_foreign";`);

    this.addSql(`alter table "slot" add constraint "slot_snack_machine_id_foreign" foreign key ("snack_machine_id") references "snack_machine" ("id") on update cascade;`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20231103124829_UpdateCascading extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "slot" drop constraint "slot_snack_pile_snack_id_foreign";');

    this.addSql('alter table "slot" alter column "snack_pile_snack_id" drop default;');
    this.addSql('alter table "slot" alter column "snack_pile_snack_id" type uuid using ("snack_pile_snack_id"::text::uuid);');
    this.addSql('alter table "slot" alter column "snack_pile_snack_id" drop not null;');
    this.addSql('alter table "slot" add constraint "slot_snack_pile_snack_id_foreign" foreign key ("snack_pile_snack_id") references "snack" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "slot" drop constraint "slot_snack_pile_snack_id_foreign";');

    this.addSql('alter table "slot" alter column "snack_pile_snack_id" drop default;');
    this.addSql('alter table "slot" alter column "snack_pile_snack_id" type uuid using ("snack_pile_snack_id"::text::uuid);');
    this.addSql('alter table "slot" alter column "snack_pile_snack_id" set not null;');
    this.addSql('alter table "slot" add constraint "slot_snack_pile_snack_id_foreign" foreign key ("snack_pile_snack_id") references "snack" ("id") on update cascade on delete no action;');
  }

}

import { Migration } from '@mikro-orm/migrations';
import { Snack } from '../../app/snack/snack';

export class Migration20230810210603_AddSlotAndSnackEntities extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "snack" ("id" uuid not null, "name" varchar(255) not null, constraint "snack_pkey" primary key ("id"));');

    this.addSql('create table "slot" ("id" uuid not null, "position" int not null, "snack_machine_id" uuid not null, "snack_pile_quantity" int not null, "snack_pile_price" numeric(12,2) not null, "snack_pile_snack_id" uuid not null, constraint "slot_pkey" primary key ("id"));');
    this.addSql('alter table "slot" add constraint "slot_snack_pile_snack_id_unique" unique ("snack_pile_snack_id");');

    this.addSql('alter table "slot" add constraint "slot_snack_machine_id_foreign" foreign key ("snack_machine_id") references "snack_machine" ("id") on update cascade;');
    this.addSql('alter table "slot" add constraint "slot_snack_pile_snack_id_foreign" foreign key ("snack_pile_snack_id") references "snack" ("id") on update cascade;');

    this.addSql(`insert into "snack" ("id", "name") values ('${Snack.Chocolate.id}', '${Snack.Chocolate.name}');`);
    this.addSql(`insert into "snack" ("id", "name") values ('${Snack.Soda.id}', '${Snack.Soda.name}');`);
    this.addSql(`insert into "snack" ("id", "name") values ('${Snack.Gum.id}', '${Snack.Gum.name}');`);
  }

  async down(): Promise<void> {
    this.addSql('alter table "slot" drop constraint "slot_snack_pile_snack_id_foreign";');

    this.addSql('drop table if exists "snack" cascade;');

    this.addSql('drop table if exists "slot" cascade;');
  }

}

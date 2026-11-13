import { Migration } from '@mikro-orm/migrations';

export class Migration20261113221734_InitialSchema extends Migration {

  override name = 'Migration20261113221734_InitialSchema';

  override up(): void | Promise<void> {
    this.addSql(`create table "snack" ("id" uuid not null, "name" varchar(255) not null, primary key ("id"));`);

    this.addSql(`create table "snack_machine" ("id" uuid not null, "money_one_cent_count" int not null, "money_ten_cent_count" int not null, "money_quarter_count" int not null, "money_one_dollar_count" int not null, "money_five_dollar_count" int not null, "money_twenty_dollar_count" int not null, "money_in_transaction" varchar(255) not null, primary key ("id"));`);

    this.addSql(`create table "slot" ("id" uuid not null, "position" int not null, "snack_machine_id" uuid not null, "snack_pile_quantity" int not null, "snack_pile_price" varchar(255) not null, "snack_pile_snack_id" uuid null, primary key ("id"));`);

    this.addSql(`alter table "slot" add constraint "slot_snack_machine_id_foreign" foreign key ("snack_machine_id") references "snack_machine" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "slot" add constraint "slot_snack_pile_snack_id_foreign" foreign key ("snack_pile_snack_id") references "snack" ("id") on update cascade on delete cascade;`);

    this.addSql(`insert into "snack" ("id", "name") values ('01a1d6fc-6819-7407-848a-bfb5746ee9b8', 'Chocolate'), ('01a1d6fc-687d-7c63-b6be-80b041969631', 'Soda'), ('01a1d6fc-68ee-7103-9989-0d47be47a684', 'Gum');`);
  }

}

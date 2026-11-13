import { Migration } from '@mikro-orm/migrations';

export class Migration20261113221730_InitialSchema extends Migration {

  override name = 'Migration20261113221730_InitialSchema';

  override up(): void | Promise<void> {
    this.addSql(`create table "atm" ("id" uuid not null, "money_charged" varchar(255) not null, "money_one_cent_count" int not null, "money_ten_cent_count" int not null, "money_quarter_count" int not null, "money_one_dollar_count" int not null, "money_five_dollar_count" int not null, "money_twenty_dollar_count" int not null, primary key ("id"));`);
  }

}

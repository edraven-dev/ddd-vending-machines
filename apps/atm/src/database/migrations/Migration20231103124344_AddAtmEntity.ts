import { Migration } from '@mikro-orm/migrations';

export class Migration20231103124344_AddAtmEntity extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "atm" ("id" uuid not null, "money_charged" numeric(18,2) not null, "money_one_cent_count" int not null, "money_ten_cent_count" int not null, "money_quarter_count" int not null, "money_one_dollar_count" int not null, "money_five_dollar_count" int not null, "money_twenty_dollar_count" int not null, constraint "atm_pkey" primary key ("id"));');
  }

}

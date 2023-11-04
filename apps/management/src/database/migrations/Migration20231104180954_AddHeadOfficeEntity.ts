import { Migration } from '@mikro-orm/migrations';

export class Migration20231104180954_AddHeadOfficeEntity extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "head_office" ("id" uuid not null, "balance" numeric(18,2) not null, "cash_one_cent_count" int not null, "cash_ten_cent_count" int not null, "cash_quarter_count" int not null, "cash_one_dollar_count" int not null, "cash_five_dollar_count" int not null, "cash_twenty_dollar_count" int not null, constraint "head_office_pkey" primary key ("id"));');
  }

}

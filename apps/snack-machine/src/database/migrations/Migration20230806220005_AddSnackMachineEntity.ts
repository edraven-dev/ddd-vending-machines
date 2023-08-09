import { Migration } from '@mikro-orm/migrations';

export class Migration20230806220005_AddSnackMachineEntity extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "snack_machine" ("id" uuid not null, "money_one_cent_count" int not null, "money_ten_cent_count" int not null, "money_quarter_count" int not null, "money_one_dollar_count" int not null, "money_five_dollar_count" int not null, "money_twenty_dollar_count" int not null, constraint "snack_machine_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "snack_machine" cascade;');
  }

}

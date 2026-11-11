import { Migration } from '@mikro-orm/migrations';

export class Migration20240102213718_ChangeMoneyChargedType extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "atm" alter column "money_charged" type varchar(255) using ("money_charged"::varchar(255));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "atm" alter column "money_charged" type numeric(18,2) using ("money_charged"::numeric(18,2));');
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20231230224434_AddMoneyInTransaction extends Migration {

  async up(): Promise<void> {
    this.addSql(`alter table "snack_machine" add column "money_in_transaction" varchar(255) not null;`);
  }

  async down(): Promise<void> {
    this.addSql('alter table "snack_machine" drop column "money_in_transaction";');
  }

}

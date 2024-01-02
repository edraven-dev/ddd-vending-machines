import { Migration } from '@mikro-orm/migrations';

export class Migration20240102211910_ChangeTypeOfSnackPrice extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "slot" alter column "snack_pile_price" type varchar(255) using ("snack_pile_price"::varchar(255));');
  }

  async down(): Promise<void> {
    this.addSql('alter table "slot" alter column "snack_pile_price" type numeric(12,2) using ("snack_pile_price"::numeric(12,2));');
  }

}

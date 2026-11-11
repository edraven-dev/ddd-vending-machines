import { Migration } from '@mikro-orm/migrations';

export class Migration20240102213147_RemoveSnackUniqueConstraint extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "slot" drop constraint "slot_snack_pile_snack_id_unique";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "slot" add constraint "slot_snack_pile_snack_id_unique" unique ("snack_pile_snack_id");');
  }

}

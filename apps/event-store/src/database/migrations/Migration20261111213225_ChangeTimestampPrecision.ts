import { Migration } from '@mikro-orm/migrations';

export class Migration20261111213225_ChangeTimestampPrecision extends Migration {
  override name = 'Migration20261111213225_ChangeTimestampPrecision';

  override up(): void | Promise<void> {
    this.addSql(
      `alter table "event_store" alter column "timestamp" type timestamptz using ("timestamp"::timestamptz);`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(
      `alter table "event_store" alter column "timestamp" type timestamptz(0) using ("timestamp"::timestamptz(0));`,
    );
  }
}

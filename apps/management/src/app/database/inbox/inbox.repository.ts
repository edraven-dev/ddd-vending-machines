import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, Provider } from '@nestjs/common';
import { Inbox } from '../../management/inbox.interface';
import InboxEntity from './inbox.entity';

@Injectable()
export class MikroOrmInbox implements Inbox {
  constructor(private readonly em: EntityManager) {}

  async tryRecord(consumer: string, eventId: string): Promise<boolean> {
    const { affectedRows } = await this.em
      .createQueryBuilder(InboxEntity)
      .insert({ consumer, eventId })
      .onConflict(['consumer', 'eventId'])
      .ignore()
      .execute('run');

    return affectedRows === 1;
  }
}

export const InboxProvider: Provider = {
  provide: Inbox,
  useClass: MikroOrmInbox,
};

import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import InboxEntity from '../../../../app/database/inbox/inbox.entity';
import { MikroOrmInbox } from '../../../../app/database/inbox/inbox.repository';

describe('MikroOrmInbox', () => {
  const queryBuilder = {
    insert: vi.fn<(data: Pick<InboxEntity, 'consumer' | 'eventId'>) => unknown>().mockReturnThis(),
    onConflict: vi.fn<(fields: (keyof InboxEntity)[]) => unknown>().mockReturnThis(),
    ignore: vi.fn<() => unknown>().mockReturnThis(),
    execute: vi.fn<(method: 'run') => Promise<{ affectedRows: number }>>(),
  };
  const entityManagerMock = {
    createQueryBuilder: vi.fn<(entityName: typeof InboxEntity) => typeof queryBuilder>(() => queryBuilder),
  };
  let inbox: MikroOrmInbox;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [MikroOrmInbox, { provide: EntityManager, useValue: entityManagerMock }],
    }).compile();

    inbox = module.get(MikroOrmInbox);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#tryRecord', () => {
    it('should insert the event for the consumer and ignore a conflict', async () => {
      queryBuilder.execute.mockResolvedValueOnce({ affectedRows: 1 });
      const eventId = randomUUID();

      await inbox.tryRecord('BalanceChangedHandler', eventId);

      expect(entityManagerMock.createQueryBuilder).toHaveBeenCalledWith(InboxEntity);
      expect(queryBuilder.insert).toHaveBeenCalledWith({ consumer: 'BalanceChangedHandler', eventId });
      expect(queryBuilder.onConflict).toHaveBeenCalledWith(['consumer', 'eventId']);
      expect(queryBuilder.ignore).toHaveBeenCalledOnce();
      expect(queryBuilder.execute).toHaveBeenCalledWith('run');
    });

    it('should return true when the event was recorded now', async () => {
      queryBuilder.execute.mockResolvedValueOnce({ affectedRows: 1 });

      await expect(inbox.tryRecord('BalanceChangedHandler', randomUUID())).resolves.toBe(true);
    });

    it('should return false when the event was already recorded', async () => {
      queryBuilder.execute.mockResolvedValueOnce({ affectedRows: 0 });

      await expect(inbox.tryRecord('BalanceChangedHandler', randomUUID())).resolves.toBe(false);
    });

    it('should build an insert that does nothing when the event was already recorded', () => {
      const orm = new MikroORM({
        dbName: 'unused',
        metadataProvider: ReflectMetadataProvider,
        entities: [InboxEntity],
      });

      const query = orm.em
        .createQueryBuilder(InboxEntity)
        .insert({ consumer: 'BalanceChangedHandler', eventId: randomUUID() })
        .onConflict(['consumer', 'eventId'])
        .ignore()
        .getQuery();

      expect(query).toMatch(
        /^insert into "inbox" \("consumer", "event_id"\) .* on conflict \("consumer", "event_id"\) do nothing/,
      );
    });
  });
});

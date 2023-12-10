import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BalanceChangedEvent } from '@vending-machines/events';

@EventsHandler(BalanceChangedEvent)
export class BalanceChangedHandler implements IEventHandler<BalanceChangedEvent> {
  handle(event: BalanceChangedEvent) {
    console.log('handler:', event);
  }
}

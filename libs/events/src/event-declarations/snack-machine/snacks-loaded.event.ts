import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type SnacksLoadedEventPayload = {
  slotPosition: number;
  snackPileQuantity: number;
  snackId: string;
  snackPrice: string;
};

export class SnacksLoadedEvent extends DomainEvent<SnacksLoadedEventPayload> {
  static override readonly eventType = EventType.SnacksLoaded;
}

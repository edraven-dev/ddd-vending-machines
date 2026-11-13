import { DomainEvent } from '../../lib/domain-event';
import { EventType } from '../../lib/event-type';

type SnackBoughtEventPayload = {
  slotPosition: number;
  snackPileQuantity: number;
  snackId: string;
  snackPrice: string;
};

export class SnackBoughtEvent extends DomainEvent<SnackBoughtEventPayload> {
  static override readonly eventType = EventType.SnackBought;
}

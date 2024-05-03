import { DomainEvent } from '../../lib/domain-event';

type SnacksLoadedEventPayload = {
  slotPosition: number;
  snackPileQuantity: number;
  snackId: string;
  snackPrice: string;
};

export class SnacksLoadedEvent extends DomainEvent<SnacksLoadedEventPayload> {}

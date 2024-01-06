import { DomainEvent } from '../../lib/domain-event';

type SnackBoughtEventPayload = {
  slotPosition: number;
  snackPileQuantity: number;
  snackId: string;
  snackPrice: string;
};

export class SnackBoughtEvent extends DomainEvent<SnackBoughtEventPayload> {}

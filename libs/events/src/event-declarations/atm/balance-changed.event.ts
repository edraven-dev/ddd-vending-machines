export class BalanceChangedEvent {
  constructor(
    public readonly amountWithCommissionValue: string,
    public readonly occuredOn: Date = new Date(),
  ) {}
}

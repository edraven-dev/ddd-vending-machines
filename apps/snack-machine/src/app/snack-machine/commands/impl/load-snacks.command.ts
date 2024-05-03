export class LoadSnacksCommand {
  constructor(
    public readonly id: string,
    public readonly position: number,
    public readonly quantity: number,
  ) {}
}

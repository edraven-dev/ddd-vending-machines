export interface Inbox {
  tryRecord(consumer: string, eventId: string): boolean | Promise<boolean>;
}

export const Inbox = Symbol('Inbox');

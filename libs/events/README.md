# events

## Handling events

Each `@EventsHandler()` class must declare a kebab-case `static readonly subscriptionName`. The handler consumes from its own queue, `q.<app>.<eventType>.<subscriptionName>`, with its own retries and dead-letter queue, so two handlers of one event type in an app need different names.

## Running unit tests

Run `pnpm turbo run test --filter=@vending-machines/events` to execute the unit tests via [Vitest](https://vitest.dev).

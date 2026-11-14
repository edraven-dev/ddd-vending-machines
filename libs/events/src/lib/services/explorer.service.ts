import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { IEvent, IEventHandler } from '@nestjs/cqrs';

// Metadata key set by @EventsHandler()
const EVENTS_HANDLER_METADATA = '__eventsHandler__';

@Injectable()
export class ExplorerService<EventBase extends IEvent = IEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  exploreEvents(): [Type<EventBase>, Type<IEventHandler>][] {
    return [...this.modulesContainer.values()].flatMap((module) =>
      [...module.providers.values()].flatMap((wrapper) => this.eventsHandledBy(wrapper)),
    );
  }

  private eventsHandledBy(wrapper: InstanceWrapper): [Type<EventBase>, Type<IEventHandler>][] {
    const handlerClass: unknown = wrapper.instance?.constructor;
    if (typeof handlerClass !== 'function') {
      return [];
    }
    const eventClasses: Type<EventBase>[] = Reflect.getMetadata(EVENTS_HANDLER_METADATA, handlerClass) ?? [];
    return eventClasses.map((eventClass) => [eventClass, handlerClass as Type<IEventHandler>]);
  }
}

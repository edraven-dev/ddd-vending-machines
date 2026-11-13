import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type { Module } from '@nestjs/core/injector/module';
import { IEvent, IEventHandler } from '@nestjs/cqrs';

// Metadata key set by @EventsHandler(). @nestjs/cqrs doesn't export it, and its package exports block dist/ imports.
const EVENTS_HANDLER_METADATA = '__eventsHandler__';

@Injectable()
export class ExplorerService<EventBase extends IEvent = IEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  exploreEvents(): [Type<EventBase>, Type<IEventHandler>][] {
    const modules = [...this.modulesContainer.values()];
    const events = this.flatMap<IEventHandler<EventBase>>(modules, (instance) =>
      this.filterProvider(instance, EVENTS_HANDLER_METADATA),
    );
    return events;
  }

  private flatMap<T>(
    modules: Module[],
    callback: (instance: InstanceWrapper) => [Type<unknown>, Type<unknown>] | undefined,
  ): [Type<EventBase>, Type<T>][] {
    const items = modules
      .map((module) => [...module.providers.values()].map((provider) => callback(provider)))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element && element[0] !== undefined) as [Type<EventBase>, Type<T>][];
  }

  private filterProvider(wrapper: InstanceWrapper, metadataKey: string): [Type<unknown>, Type<unknown>] | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    const eventTypes = this.extractMetadata(instance, metadataKey);
    if (!eventTypes || !eventTypes[0] || !eventTypes[1]) {
      return undefined;
    }
    return eventTypes;
  }

  private extractMetadata(
    instance: Record<string, unknown>,
    metadataKey: string,
  ): [Type<unknown>, Type<unknown>] | undefined {
    if (!instance.constructor) {
      return;
    }
    const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
    if (!metadata) {
      return;
    }
    const [eventType] = metadata;
    return [eventType, instance.constructor as Type<unknown>];
  }
}

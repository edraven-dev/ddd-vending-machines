import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { IEvent, IEventHandler } from '@nestjs/cqrs';
import { EVENTS_HANDLER_METADATA } from '@nestjs/cqrs/dist/decorators/constants';

@Injectable()
export class ExplorerService<EventBase extends IEvent = IEvent> {
  constructor(private readonly modulesContainer: ModulesContainer) {}

  exploreEvents(): [string, Type<EventBase>, Type<IEventHandler>][] {
    const modules = [...this.modulesContainer.values()];
    const events = this.flatMap<IEventHandler<EventBase>>(modules, (moduleName, instance) =>
      this.filterProvider(moduleName, instance, EVENTS_HANDLER_METADATA),
    );
    return events;
  }

  private flatMap<T>(
    modules: Module[],
    callback: (moduleName: string, instance: InstanceWrapper) => [string, Type<unknown>, Type<unknown>] | undefined,
  ): [string, Type<EventBase>, Type<T>][] {
    const items = modules
      .map((module) => [...module.providers.values()].map((provider) => callback(module.name, provider)))
      .reduce((a, b) => a.concat(b), []);
    return items.filter((element) => !!element && element[1] !== undefined) as [string, Type<EventBase>, Type<T>][];
  }

  private filterProvider(
    moduleName: string,
    wrapper: InstanceWrapper,
    metadataKey: string,
  ): [string, Type<unknown>, Type<unknown>] | undefined {
    const { instance } = wrapper;
    if (!instance) {
      return undefined;
    }
    const eventTypes = this.extractMetadata(instance, metadataKey);
    if (!eventTypes || !eventTypes[0] || !eventTypes[1]) {
      return undefined;
    }
    const [eventType, eventHandler] = eventTypes;
    return [moduleName, eventType, eventHandler];
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

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AtmProtoService, SnackMachineProtoService } from '@vending-machines/proto';
import { join } from 'node:path';
import { BullConfig, PRUNE_HEAD_OFFICES_QUEUE_NAME } from '../config/bull.config';
import { BalanceChangedHandler } from './balance-changed.handler';
import { CommandHandlers } from './commands/handlers';
import { HeadOfficeFactory } from './head-office.factory';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';
import { AtmProtoServiceClient } from './proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from './proto-clients/snack-machine-proto-service.client';
import { PruneHeadOfficesProcessor } from './prune-head-offices.processor';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [BullModule.registerQueueAsync({ name: PRUNE_HEAD_OFFICES_QUEUE_NAME, useClass: BullConfig }), CqrsModule],
  controllers: [ManagementController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    HeadOfficeFactory,
    ManagementService,
    PruneHeadOfficesProcessor,
    BalanceChangedHandler,
    {
      provide: AtmProtoServiceClient,
      useValue: new AtmProtoServiceClient(
        ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: 'atm',
            protoPath: join(__dirname, 'assets/atm/atm.proto'),
            url: process.env.ATM_GRPC_URL || 'localhost:50051',
          },
        }).getService<AtmProtoService>('AtmProtoService'),
      ),
    },
    {
      provide: SnackMachineProtoServiceClient,
      useValue: new SnackMachineProtoServiceClient(
        ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: {
            package: 'snack_machine',
            protoPath: join(__dirname, 'assets/snack-machine/snack-machine.proto'),
            url: process.env.SNACK_MACHINE_GRPC_URL || 'localhost:50052',
          },
        }).getService<SnackMachineProtoService>('SnackMachineProtoService'),
      ),
    },
  ],
})
export class ManagementModule {}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AtmProtoService, SnackMachineProtoService } from '@vending-machines/proto';
import { join } from 'node:path';
import { BalanceChangedHandler } from './balance-changed.handler';
import { CommandHandlers } from './commands/handlers';
import { HeadOfficeFactory } from './head-office.factory';
import { ManagementController } from './management.controller';
import { AtmProtoServiceClient } from './proto-clients/atm-proto-service.client';
import { SnackMachineProtoServiceClient } from './proto-clients/snack-machine-proto-service.client';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [ManagementController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    BalanceChangedHandler,
    HeadOfficeFactory,
    {
      provide: AtmProtoServiceClient,
      useValue: new AtmProtoServiceClient(
        ClientProxyFactory.create({
          transport: Transport.GRPC,
          options: { package: 'atm', protoPath: join(__dirname, 'assets/atm/atm.proto'), url: 'localhost:50051' },
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
            url: 'localhost:50052',
          },
        }).getService<SnackMachineProtoService>('SnackMachineProtoService'),
      ),
    },
  ],
})
export class ManagementModule {}

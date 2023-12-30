import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { SnackMachineProtoService } from '@vending-machines/proto';
import { UnloadMoneyDto } from '@vending-machines/shared';
import { join } from 'node:path';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class SnackMachineProtoServiceClient {
  private readonly client: SnackMachineProtoService;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'snack_machine',
        protoPath: join(__dirname, 'assets/snack-machine/snack-machine.proto'),
        url: 'localhost:50052',
      },
    }).getService<SnackMachineProtoService>('SnackMachineProtoService');
  }

  unloadMoney(): Promise<UnloadMoneyDto> {
    return lastValueFrom(this.client.unloadMoney(null));
  }
}

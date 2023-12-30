import { Injectable } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AtmProtoService } from '@vending-machines/proto';
import { LoadMoneyDto } from '@vending-machines/shared';
import { join } from 'node:path';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AtmProtoServiceClient {
  private readonly client: AtmProtoService;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        package: 'atm',
        protoPath: join(__dirname, 'assets/atm/atm.proto'),
        url: 'localhost:50051',
      },
    }).getService<AtmProtoService>('AtmProtoService');
  }

  loadMoney(dto: LoadMoneyDto): Promise<void> {
    return lastValueFrom(this.client.loadMoney(dto));
  }
}

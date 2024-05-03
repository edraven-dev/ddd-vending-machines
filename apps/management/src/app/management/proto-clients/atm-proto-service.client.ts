import { Injectable } from '@nestjs/common';
import { AtmProtoService } from '@vending-machines/proto';
import { LoadMoneyDto } from '@vending-machines/shared';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AtmProtoServiceClient {
  private readonly service: AtmProtoService;

  constructor(service: AtmProtoService) {
    this.service = service;
  }

  loadMoney(dto: LoadMoneyDto): Promise<void> {
    return lastValueFrom(this.service.loadMoney(dto));
  }
}

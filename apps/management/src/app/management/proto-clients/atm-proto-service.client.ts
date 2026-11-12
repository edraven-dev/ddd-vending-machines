import { Injectable } from '@nestjs/common';
import type { AtmProtoService } from '@vending-machines/proto';
import { LoadMoneyDto } from '@vending-machines/shared';
import { lastValueFrom } from 'rxjs';
import { mapGrpcErrors } from './map-grpc-errors';

@Injectable()
export class AtmProtoServiceClient {
  private readonly service: AtmProtoService;

  constructor(service: AtmProtoService) {
    this.service = service;
  }

  loadMoney(dto: LoadMoneyDto): Promise<void> {
    return lastValueFrom(this.service.loadMoney(dto).pipe(mapGrpcErrors));
  }
}

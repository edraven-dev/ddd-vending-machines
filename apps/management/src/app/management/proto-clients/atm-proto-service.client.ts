import { Injectable } from '@nestjs/common';
import type { AtmProtoService, LoadMoneyRequest } from '@vending-machines/proto';
import { lastValueFrom } from 'rxjs';
import { mapGrpcErrors } from './map-grpc-errors';

@Injectable()
export class AtmProtoServiceClient {
  private readonly service: AtmProtoService;

  constructor(service: AtmProtoService) {
    this.service = service;
  }

  loadMoney(request: LoadMoneyRequest): Promise<void> {
    return lastValueFrom(this.service.loadMoney(request).pipe(mapGrpcErrors));
  }
}

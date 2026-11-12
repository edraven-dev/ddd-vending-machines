import { Injectable } from '@nestjs/common';
import type { SnackMachineProtoService } from '@vending-machines/proto';
import { UnloadMoneyDto } from '@vending-machines/shared';
import { lastValueFrom } from 'rxjs';
import { mapGrpcErrors } from './map-grpc-errors';

@Injectable()
export class SnackMachineProtoServiceClient {
  private readonly service: SnackMachineProtoService;

  constructor(service: SnackMachineProtoService) {
    this.service = service;
  }

  unloadMoney(id: string): Promise<UnloadMoneyDto> {
    return lastValueFrom(this.service.unloadMoney({ id }).pipe(mapGrpcErrors));
  }
}

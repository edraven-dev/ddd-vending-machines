import type { UnloadMoneyDto } from '@vending-machines/shared';
import type { Observable } from 'rxjs';

export interface UnloadMoneyRequest {
  id: string;
}

export interface CreateSnackMachineRequest {
  id: string;
}

export interface DeleteSnackMachineRequest {
  id: string;
}

export interface SnackMachineProtoService {
  unloadMoney(request: UnloadMoneyRequest): Observable<UnloadMoneyDto>;
  createSnackMachine(request: CreateSnackMachineRequest): Observable<void>;
  deleteSnackMachine(request: DeleteSnackMachineRequest): Observable<void>;
}

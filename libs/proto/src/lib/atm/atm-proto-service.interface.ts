import type { CoinsAndNotes } from '@vending-machines/shared';
import type { Observable } from 'rxjs';

export interface LoadMoneyRequest {
  id: string;
  money: CoinsAndNotes;
}

export interface CreateAtmRequest {
  id: string;
}

export interface DeleteAtmRequest {
  id: string;
}

export interface AtmProtoService {
  loadMoney(request: LoadMoneyRequest): Observable<void>;
  createAtm(request: CreateAtmRequest): Observable<void>;
  deleteAtm(request: DeleteAtmRequest): Observable<void>;
}

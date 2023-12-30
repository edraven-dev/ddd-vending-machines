import { UnloadMoneyDto } from '@vending-machines/shared';
import { Observable } from 'rxjs';

export interface SnackMachineProtoService {
  unloadMoney(emtpty: null): Observable<UnloadMoneyDto>;
}

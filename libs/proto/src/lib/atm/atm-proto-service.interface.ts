import { LoadMoneyDto } from '@vending-machines/shared';
import { Observable } from 'rxjs';

export interface AtmProtoService {
  loadMoney(dto: LoadMoneyDto): Observable<void>;
}

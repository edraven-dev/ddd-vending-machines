import { Type } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { GetHeadOfficeHandler } from './get-head-office.handler';

export const QueryHandlers: Type<IQueryHandler>[] = [GetHeadOfficeHandler];

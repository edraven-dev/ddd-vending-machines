import { Controller, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { HeadOfficeDto } from './dto/head-office.dto';
import { GetHeadOfficeQuery } from './queries/impl/get-head-office.query';

@Controller('management')
export class ManagementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getHeadOffice(): Promise<HeadOfficeDto> {
    return this.queryBus.execute(new GetHeadOfficeQuery());
  }
}

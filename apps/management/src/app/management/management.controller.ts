import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoadCashToAtmCommand } from './commands/impl/load-cash-to-atm.command';
import { UnloadCashFromSnackMachineCommand } from './commands/impl/unload-cash-from-snack-machine.command';
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

  @Post('load-cash-to-atm')
  @HttpCode(HttpStatus.OK)
  async loadCashToAtm(): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new LoadCashToAtmCommand());
    return this.queryBus.execute(new GetHeadOfficeQuery());
  }

  @Post('unload-cash-from-snack-machine')
  @HttpCode(HttpStatus.OK)
  async unloadCashFromSnackMachine(): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new UnloadCashFromSnackMachineCommand());
    return this.queryBus.execute(new GetHeadOfficeQuery());
  }
}

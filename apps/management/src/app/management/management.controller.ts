import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  @Get(':id')
  getHeadOffice(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<HeadOfficeDto> {
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }

  @Post(':id/load-cash-to-atm')
  @HttpCode(HttpStatus.OK)
  async loadCashToAtm(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new LoadCashToAtmCommand(id));
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }

  @Post(':id/unload-cash-from-snack-machine')
  @HttpCode(HttpStatus.OK)
  async unloadCashFromSnackMachine(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new UnloadCashFromSnackMachineCommand(id));
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }
}

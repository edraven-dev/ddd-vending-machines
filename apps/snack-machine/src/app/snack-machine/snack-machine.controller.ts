import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { Money, UnloadMoneyDto } from '@vending-machines/shared';
import { BuySnackCommand } from './commands/impl/buy-snack.command';
import { InsertMoneyCommand } from './commands/impl/insert-money.command';
import { ReturnMoneyCommand } from './commands/impl/return-money.command';
import { BuySnackDto } from './dto/buy-snack.dto';
import { InsertMoneyDto } from './dto/insert-money.dto';
import { MoneyInMachineDto } from './dto/money-in-machine.dto';
import { SnackMachineDto } from './dto/snack-machine.dto';
import { GetMoneyInMachineQuery } from './queries/impl/get-money-in-machine.query';
import { GetSnackMachineQuery } from './queries/impl/get-snack-machine.query';
import { SnackMachineService } from './snack-machine.service';

@Controller('snack-machine')
export class SnackMachineController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly snackMachineService: SnackMachineService,
  ) {}

  @Get(':id')
  getSnackMachine(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<SnackMachineDto> {
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @Get(':id/money-in-machine')
  getMoneyInMachine(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<MoneyInMachineDto> {
    return this.queryBus.execute(new GetMoneyInMachineQuery(id));
  }

  @Put(':id/insert-money')
  async insertMoney(
    @Body() requestDto: InsertMoneyDto,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SnackMachineDto> {
    await this.commandBus.execute(new InsertMoneyCommand(id, new Money(...requestDto.money)));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @HttpCode(200)
  @Post(':id/buy-snack')
  async buySnack(
    @Body() buySnackDto: BuySnackDto,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<SnackMachineDto> {
    await this.commandBus.execute(new BuySnackCommand(id, buySnackDto.position));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @HttpCode(200)
  @Post(':id/return-money')
  async returnMoney(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<SnackMachineDto> {
    await this.commandBus.execute(new ReturnMoneyCommand(id));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @GrpcMethod('SnackMachineProtoService', 'UnloadMoney')
  unloadMoney({ id }: { id: string }): Promise<UnloadMoneyDto> {
    return this.snackMachineService.unloadMoney(id);
  }
}

import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
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

  @Get()
  getSnackMachine(): Promise<SnackMachineDto> {
    return this.queryBus.execute(new GetSnackMachineQuery());
  }

  @Get('money-in-machine')
  getMoneyInMachine(): Promise<MoneyInMachineDto> {
    return this.queryBus.execute(new GetMoneyInMachineQuery());
  }

  @Put('insert-money')
  async insertMoney(@Body() requestDto: InsertMoneyDto): Promise<SnackMachineDto> {
    await this.commandBus.execute(new InsertMoneyCommand(new Money(...requestDto.money)));
    return this.queryBus.execute(new GetSnackMachineQuery());
  }

  @HttpCode(200)
  @Post('buy-snack')
  async buySnack(@Body() buySnackDto: BuySnackDto): Promise<SnackMachineDto> {
    await this.commandBus.execute(new BuySnackCommand(buySnackDto.position));
    return this.queryBus.execute(new GetSnackMachineQuery());
  }

  @HttpCode(200)
  @Post('return-money')
  async returnMoney(): Promise<SnackMachineDto> {
    await this.commandBus.execute(new ReturnMoneyCommand());
    return this.queryBus.execute(new GetSnackMachineQuery());
  }

  @GrpcMethod('SnackMachineProtoService', 'UnloadMoney')
  unloadMoney(): Promise<UnloadMoneyDto> {
    return this.snackMachineService.unloadMoney();
  }
}

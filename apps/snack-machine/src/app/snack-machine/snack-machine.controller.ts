import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BuySnackCommand } from './commands/impl/buy-snack.command';
import { InsertMoneyCommand } from './commands/impl/insert-money.command';
import { ReturnMoneyCommand } from './commands/impl/return-money.command';
import { InsertMoneyDto } from './dto/insert-money.dto';
import { MoneyInMachineDto } from './dto/money-in-machine.dto';
import { Money } from './money';
import { GetMoneyInMachineQuery } from './queries/impl/get-money-in-machine.query';

@Controller('snack-machine')
export class SnackMachineController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Put('insert-money')
  async insertMoney(@Body() requestDto: InsertMoneyDto): Promise<MoneyInMachineDto> {
    await this.commandBus.execute(new InsertMoneyCommand(new Money(...requestDto.money)));
    return this.queryBus.execute(new GetMoneyInMachineQuery());
  }

  @HttpCode(200)
  @Post('buy-snack')
  async buySnack(): Promise<MoneyInMachineDto> {
    await this.commandBus.execute(new BuySnackCommand());
    return this.queryBus.execute(new GetMoneyInMachineQuery());
  }

  @HttpCode(200)
  @Post('return-money')
  async returnMoney(): Promise<MoneyInMachineDto> {
    await this.commandBus.execute(new ReturnMoneyCommand());
    return this.queryBus.execute(new GetMoneyInMachineQuery());
  }

  @Get('money-in-machine')
  getMoneyInMachine(): Promise<MoneyInMachineDto> {
    return this.queryBus.execute(new GetMoneyInMachineQuery());
  }
}

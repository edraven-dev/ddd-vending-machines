import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Money } from '@vending-machines/shared';
import { LoadMoneyCommand } from './commands/impl/load-money.command';
import { TakeMoneyCommand } from './commands/impl/take-money.command';
import { AtmDto } from './dto/atm.dto';
import { LoadMoneyDto } from './dto/load-money.dto';
import { TakeMoneyDto } from './dto/take-money.dto';
import { GetAtmQuery } from './queries/impl/get-atm.query';

@Controller('atm')
export class AtmController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getAtm(): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery());
  }

  @Put('load-money')
  async loadMoney(@Body() requestDto: LoadMoneyDto): Promise<AtmDto> {
    await this.commandBus.execute(new LoadMoneyCommand(new Money(...requestDto.money)));
    return this.queryBus.execute(new GetAtmQuery());
  }

  @HttpCode(200)
  @Post('take-money')
  async takeMoney(@Body() requestDto: TakeMoneyDto): Promise<AtmDto> {
    await this.commandBus.execute(new TakeMoneyCommand(requestDto.amount));
    return this.queryBus.execute(new GetAtmQuery());
  }
}

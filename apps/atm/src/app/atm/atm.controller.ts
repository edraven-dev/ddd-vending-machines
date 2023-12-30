import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { LoadMoneyDto, Money } from '@vending-machines/shared';
import { AtmService } from './atm.service';
import { TakeMoneyCommand } from './commands/impl/take-money.command';
import { AtmDto } from './dto/atm.dto';
import { TakeMoneyDto } from './dto/take-money.dto';
import { GetAtmQuery } from './queries/impl/get-atm.query';

@Controller('atm')
export class AtmController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly atmService: AtmService,
  ) {}

  @Get()
  getAtm(): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery());
  }

  @HttpCode(200)
  @Post('take-money')
  async takeMoney(@Body() requestDto: TakeMoneyDto): Promise<AtmDto> {
    await this.commandBus.execute(new TakeMoneyCommand(requestDto.amount));
    return this.queryBus.execute(new GetAtmQuery());
  }

  @GrpcMethod('AtmProtoService', 'LoadMoney')
  async loadMoney(requestDto: LoadMoneyDto): Promise<void> {
    await this.atmService.loadMoney(new Money(...requestDto.money));
  }
}

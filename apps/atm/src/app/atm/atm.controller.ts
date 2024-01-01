import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
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

  @Get(':id')
  getAtm(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @HttpCode(200)
  @Post(':id/take-money')
  async takeMoney(
    @Body() requestDto: TakeMoneyDto,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<AtmDto> {
    await this.commandBus.execute(new TakeMoneyCommand(id, requestDto.amount));
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @GrpcMethod('AtmProtoService', 'LoadMoney')
  loadMoney(requestDto: LoadMoneyDto): Promise<void> {
    return this.atmService.loadMoney(requestDto.id, new Money(...requestDto.money));
  }
}

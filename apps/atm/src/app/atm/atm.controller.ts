import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import { LoadMoneyDto, Money } from '@vending-machines/shared';
import { AtmService } from './atm.service';
import { CreateAtmCommand } from './commands/impl/create-atm.command';
import { TakeMoneyCommand } from './commands/impl/take-money.command';
import { AtmDto } from './dto/atm.dto';
import { CreateAtmDto } from './dto/create-atm.dto';
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
  getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @Post()
  async create(@Body() requestDto: CreateAtmDto): Promise<void> {
    await this.commandBus.execute(new CreateAtmCommand(requestDto.id));
    return this.queryBus.execute(new GetAtmQuery(requestDto.id));
  }

  @Post(':id/take-money')
  @HttpCode(200)
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

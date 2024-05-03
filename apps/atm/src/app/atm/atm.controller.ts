import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoadMoneyDto, Money } from '@vending-machines/shared';
import { AtmService } from './atm.service';
import { CreateAtmCommand } from './commands/impl/create-atm.command';
import { TakeMoneyCommand } from './commands/impl/take-money.command';
import { AtmDto } from './dto/atm.dto';
import { CreateAtmDto } from './dto/create-atm.dto';
import { TakeMoneyDto } from './dto/take-money.dto';
import { GetAtmQuery } from './queries/impl/get-atm.query';

@ApiTags('ATM')
@Controller('atm')
export class AtmController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly atmService: AtmService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get ATM by id', description: 'Returns ATM by id' })
  @ApiOkResponse({ type: AtmDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiNotFoundResponse({ description: 'ATM not found' })
  getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create ATM', description: 'Creates ATM' })
  @ApiCreatedResponse({ type: AtmDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  async create(@Body() requestDto: CreateAtmDto): Promise<void> {
    await this.commandBus.execute(new CreateAtmCommand(requestDto.id));
    return this.queryBus.execute(new GetAtmQuery(requestDto.id));
  }

  @Post(':id/take-money')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Take money from ATM', description: 'Takes money from ATM' })
  @ApiOkResponse({ type: AtmDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'ATM not found' })
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

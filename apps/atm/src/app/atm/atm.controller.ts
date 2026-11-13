import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Id, idSchema, Money } from '@vending-machines/shared';
import { AtmService } from './atm.service';
import { CreateAtmCommand } from './commands/impl/create-atm.command';
import { DeleteAtmCommand } from './commands/impl/delete-atm.command';
import { TakeMoneyCommand } from './commands/impl/take-money.command';
import { AtmDto } from './dto/atm.dto';
import { type CreateAtmDto, createAtmSchema } from './dto/create-atm.dto';
import { type DeleteAtmDto, deleteAtmSchema } from './dto/delete-atm.dto';
import { type LoadMoneyDto, loadMoneySchema } from './dto/load-money.dto';
import { type TakeMoneyDto, takeMoneySchema } from './dto/take-money.dto';
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
  getById(@Param('id', { schema: idSchema }) id: Id): Promise<AtmDto> {
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create ATM', description: 'Creates ATM' })
  @ApiCreatedResponse({ type: AtmDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiConflictResponse({ description: 'ATM already exists' })
  async create(@Body({ schema: createAtmSchema }) requestDto: CreateAtmDto): Promise<AtmDto> {
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
    @Body({ schema: takeMoneySchema }) requestDto: TakeMoneyDto,
    @Param('id', { schema: idSchema }) id: Id,
  ): Promise<AtmDto> {
    await this.commandBus.execute(new TakeMoneyCommand(id, requestDto.amount));
    return this.queryBus.execute(new GetAtmQuery(id));
  }

  @GrpcMethod('AtmProtoService', 'LoadMoney')
  loadMoney(@Payload({ schema: loadMoneySchema }) requestDto: LoadMoneyDto): Promise<void> {
    return this.atmService.loadMoney(requestDto.id, new Money(...requestDto.money));
  }

  @GrpcMethod('AtmProtoService', 'CreateAtm')
  createAtm(@Payload({ schema: createAtmSchema }) { id }: CreateAtmDto): Promise<void> {
    return this.commandBus.execute(new CreateAtmCommand(id));
  }

  @GrpcMethod('AtmProtoService', 'DeleteAtm')
  deleteAtm(@Payload({ schema: deleteAtmSchema }) { id }: DeleteAtmDto): Promise<void> {
    return this.commandBus.execute(new DeleteAtmCommand(id));
  }
}

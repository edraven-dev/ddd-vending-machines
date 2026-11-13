import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Id, idSchema, Money, UnloadMoneyDto } from '@vending-machines/shared';
import { BuySnackCommand } from './commands/impl/buy-snack.command';
import { CreateSnackMachineCommand } from './commands/impl/create-snack-machine.command';
import { DeleteSnackMachineCommand } from './commands/impl/delete-snack-machine.command';
import { InsertMoneyCommand } from './commands/impl/insert-money.command';
import { LoadSnacksCommand } from './commands/impl/load-snacks.command';
import { ReturnMoneyCommand } from './commands/impl/return-money.command';
import { type BuySnackDto, buySnackSchema } from './dto/buy-snack.dto';
import { type CreateSnackMachineDto, createSnackMachineSchema } from './dto/create-snack-machine.dto';
import { type DeleteSnackMachineDto, deleteSnackMachineSchema } from './dto/delete-snack-machine.dto';
import { type InsertMoneyDto, insertMoneySchema } from './dto/insert-money.dto';
import { type LoadSnacksDto, loadSnacksSchema } from './dto/load-snacks.dto';
import { MoneyInMachineDto } from './dto/money-in-machine.dto';
import { SnackMachineDto } from './dto/snack-machine.dto';
import { type UnloadMoneyRequestDto, unloadMoneyRequestSchema } from './dto/unload-money-request.dto';
import { GetMoneyInMachineQuery } from './queries/impl/get-money-in-machine.query';
import { GetSnackMachineQuery } from './queries/impl/get-snack-machine.query';
import { SnackMachineService } from './snack-machine.service';

@ApiTags('Snack Machine')
@Controller('snack-machine')
export class SnackMachineController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly snackMachineService: SnackMachineService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get snack machine by id', description: 'Returns snack machine by id' })
  @ApiOkResponse({ type: SnackMachineDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  getById(@Param('id', { schema: idSchema }) id: Id): Promise<SnackMachineDto> {
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @Get(':id/money-in-machine')
  @ApiOperation({ summary: 'Get money in snack machine', description: 'Returns money in snack machine' })
  @ApiOkResponse({ type: MoneyInMachineDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  getMoneyInMachine(@Param('id', { schema: idSchema }) id: Id): Promise<MoneyInMachineDto> {
    return this.queryBus.execute(new GetMoneyInMachineQuery(id));
  }

  @Put(':id/insert-money')
  @ApiOperation({ summary: 'Insert money into snack machine', description: 'Inserts money into snack machine' })
  @ApiOkResponse({ type: SnackMachineDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  async insertMoney(
    @Body({ schema: insertMoneySchema }) requestDto: InsertMoneyDto,
    @Param('id', { schema: idSchema }) id: Id,
  ): Promise<SnackMachineDto> {
    await this.commandBus.execute(new InsertMoneyCommand(id, new Money(...requestDto.money)));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @Post(':id/buy-snack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buy snack from snack machine', description: 'Buys snack from snack machine' })
  @ApiOkResponse({ type: SnackMachineDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  async buySnack(
    @Body({ schema: buySnackSchema }) buySnackDto: BuySnackDto,
    @Param('id', { schema: idSchema }) id: Id,
  ): Promise<SnackMachineDto> {
    await this.commandBus.execute(new BuySnackCommand(id, buySnackDto.position));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @Post(':id/return-money')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return money from snack machine', description: 'Returns all money from snack machine' })
  @ApiOkResponse({ type: SnackMachineDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  async returnMoney(@Param('id', { schema: idSchema }) id: Id): Promise<SnackMachineDto> {
    await this.commandBus.execute(new ReturnMoneyCommand(id));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @Patch(':id/load-snacks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Load snacks into snack machine', description: 'Loads snacks into snack machine' })
  @ApiOkResponse({ type: SnackMachineDto })
  @ApiBadRequestResponse({ description: 'Validation errors' })
  @ApiNotFoundResponse({ description: 'Snack machine not found' })
  async loadSnacks(
    @Body({ schema: loadSnacksSchema }) requestDto: LoadSnacksDto,
    @Param('id', { schema: idSchema }) id: Id,
  ): Promise<SnackMachineDto> {
    await this.commandBus.execute(new LoadSnacksCommand(id, requestDto.position, requestDto.quantity));
    return this.queryBus.execute(new GetSnackMachineQuery(id));
  }

  @GrpcMethod('SnackMachineProtoService', 'UnloadMoney')
  unloadMoney(@Payload({ schema: unloadMoneyRequestSchema }) { id }: UnloadMoneyRequestDto): Promise<UnloadMoneyDto> {
    return this.snackMachineService.unloadMoney(id);
  }

  @GrpcMethod('SnackMachineProtoService', 'CreateSnackMachine')
  createSnackMachine(@Payload({ schema: createSnackMachineSchema }) { id }: CreateSnackMachineDto): Promise<void> {
    return this.commandBus.execute(new CreateSnackMachineCommand(id));
  }

  @GrpcMethod('SnackMachineProtoService', 'DeleteSnackMachine')
  deleteSnackMachine(@Payload({ schema: deleteSnackMachineSchema }) { id }: DeleteSnackMachineDto): Promise<void> {
    return this.commandBus.execute(new DeleteSnackMachineCommand(id));
  }
}

import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateHeadOfficeCommand } from './commands/impl/create-head-office.command';
import { LoadCashToAtmCommand } from './commands/impl/load-cash-to-atm.command';
import { UnloadCashFromSnackMachineCommand } from './commands/impl/unload-cash-from-snack-machine.command';
import { CreateHeadOfficeDto } from './dto/create-head-office.dto';
import { HeadOfficeDto } from './dto/head-office.dto';
import { GetHeadOfficeQuery } from './queries/impl/get-head-office.query';

@ApiTags('Management')
@Controller('management')
export class ManagementController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get head office by id', description: 'Returns head office by id' })
  @ApiOkResponse({ type: HeadOfficeDto })
  @ApiNotFoundResponse()
  getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<HeadOfficeDto> {
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create head office', description: 'Creates head office' })
  @ApiCreatedResponse({ type: HeadOfficeDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  async create(@Body() requestDto: CreateHeadOfficeDto): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new CreateHeadOfficeCommand(requestDto.id));
    return this.queryBus.execute(new GetHeadOfficeQuery(requestDto.id));
  }

  @Post(':id/load-cash-to-atm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Load cash to ATM', description: 'Loads cash to ATM' })
  @ApiOkResponse({ type: HeadOfficeDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiNotFoundResponse({ description: 'Head office not found' })
  async loadCashToAtm(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new LoadCashToAtmCommand(id));
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }

  @Post(':id/unload-cash-from-snack-machine')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unload cash from snack machine', description: 'Unloads cash from snack machine' })
  @ApiOkResponse({ type: HeadOfficeDto })
  @ApiBadRequestResponse({ description: 'Invalid UUID provided' })
  @ApiNotFoundResponse({ description: 'Head office not found' })
  async unloadCashFromSnackMachine(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<HeadOfficeDto> {
    await this.commandBus.execute(new UnloadCashFromSnackMachineCommand(id));
    return this.queryBus.execute(new GetHeadOfficeQuery(id));
  }
}

import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AtmController } from './atm.controller';
import { AtmService } from './atm.service';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';

@Module({
  imports: [CqrsModule],
  controllers: [AtmController],
  providers: [...CommandHandlers, ...QueryHandlers, AtmService],
})
export class AtmModule {}

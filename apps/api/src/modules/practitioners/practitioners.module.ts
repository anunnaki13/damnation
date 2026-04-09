import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';

@Module({
  controllers: [PractitionersController, SchedulesController],
  providers: [PractitionersService, SchedulesService],
  exports: [PractitionersService, SchedulesService],
})
export class PractitionersModule {}

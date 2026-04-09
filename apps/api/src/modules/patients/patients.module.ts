import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { TimelineService } from './timeline.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, TimelineService],
  exports: [PatientsService, TimelineService],
})
export class PatientsModule {}

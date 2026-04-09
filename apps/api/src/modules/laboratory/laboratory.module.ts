import { Module } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
import { RadiologyService } from './radiology.service';
import { RadiologyController } from './radiology.controller';
import { CriticalAlertService } from './critical-alert.service';

@Module({
  controllers: [LaboratoryController, RadiologyController],
  providers: [LaboratoryService, RadiologyService, CriticalAlertService],
  exports: [LaboratoryService, RadiologyService, CriticalAlertService],
})
export class LaboratoryModule {}

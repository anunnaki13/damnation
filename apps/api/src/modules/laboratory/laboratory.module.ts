import { Module } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
import { RadiologyService } from './radiology.service';
import { RadiologyController } from './radiology.controller';

@Module({
  controllers: [LaboratoryController, RadiologyController],
  providers: [LaboratoryService, RadiologyService],
  exports: [LaboratoryService, RadiologyService],
})
export class LaboratoryModule {}

import { Module } from '@nestjs/common';
import { InpatientService } from './inpatient.service';
import { InpatientController } from './inpatient.controller';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';

@Module({
  controllers: [InpatientController, BedController],
  providers: [InpatientService, BedService],
  exports: [InpatientService, BedService],
})
export class InpatientModule {}

import { Module } from '@nestjs/common';
import { OutpatientController } from './outpatient.controller';
import { OutpatientService } from './outpatient.service';
import { SoapService } from './soap.service';
import { DiagnosisService } from './diagnosis.service';
import { PrescriptionService } from './prescription.service';
import { OrderService } from './order.service';

@Module({
  controllers: [OutpatientController],
  providers: [OutpatientService, SoapService, DiagnosisService, PrescriptionService, OrderService],
  exports: [OutpatientService],
})
export class OutpatientModule {}

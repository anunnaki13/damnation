import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { PaymentService } from './payment.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, PaymentService],
  exports: [BillingService, PaymentService],
})
export class BillingModule {}

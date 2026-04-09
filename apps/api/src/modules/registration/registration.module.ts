import { Module } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';

@Module({
  controllers: [RegistrationController, QueueController],
  providers: [RegistrationService, QueueService],
  exports: [RegistrationService, QueueService],
})
export class RegistrationModule {}

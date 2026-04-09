import { Module } from '@nestjs/common';
import { SatusehatService } from './satusehat.service';
import { SatusehatController } from './satusehat.controller';
import { FhirBuilderService } from './fhir-builder.service';

@Module({
  controllers: [SatusehatController],
  providers: [SatusehatService, FhirBuilderService],
  exports: [SatusehatService, FhirBuilderService],
})
export class SatusehatModule {}

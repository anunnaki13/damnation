import { Module } from '@nestjs/common';
import { BpjsAuthService } from './bpjs-auth.service';
import { VClaimService } from './vclaim.service';
import { AntrolService } from './antrol.service';
import { AplicaresService } from './aplicares.service';
import { BpjsController } from './bpjs.controller';

@Module({
  controllers: [BpjsController],
  providers: [BpjsAuthService, VClaimService, AntrolService, AplicaresService],
  exports: [BpjsAuthService, VClaimService, AntrolService, AplicaresService],
})
export class BpjsModule {}

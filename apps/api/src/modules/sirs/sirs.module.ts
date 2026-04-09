import { Module } from '@nestjs/common';
import { SirsController } from './sirs.controller';
import { SirsService } from './sirs.service';
@Module({ controllers: [SirsController], providers: [SirsService], exports: [SirsService] })
export class SirsModule {}

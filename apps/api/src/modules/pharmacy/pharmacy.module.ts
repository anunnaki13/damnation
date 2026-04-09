import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { DispensingService } from './dispensing.service';
import { DispensingController } from './dispensing.controller';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { StockPredictionService } from './stock-prediction.service';

@Module({
  controllers: [MedicinesController, DispensingController, StockController],
  providers: [MedicinesService, DispensingService, StockService, StockPredictionService],
  exports: [MedicinesService, DispensingService, StockService, StockPredictionService],
})
export class PharmacyModule {}

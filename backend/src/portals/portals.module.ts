import { Module } from '@nestjs/common';
import { PortalsDataController } from './portals.controller';

@Module({
  controllers: [PortalsDataController],
})
export class PortalsDataModule {}

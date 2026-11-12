import { Module } from '@nestjs/common';
import { LiveClassesController } from './live-classes.controller';

@Module({
  controllers: [LiveClassesController],
})
export class LiveClassesModule {}

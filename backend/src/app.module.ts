import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { NeedsModule } from './modules/needs/needs.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AiModule } from './modules/ai/ai.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AidItemsModule } from './modules/aid-items/aid-items.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'blokdeprem',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Geliştirme ortamı için true, produksiyonda false olmalı
    }),
    AuthModule,
    NeedsModule,
    ShipmentsModule,
    TrackingModule,
    AiModule,
    LocationsModule,
    AidItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { PredictionsModule } from './modules/predictions/predictions.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    BlockchainModule,
    LocationsModule,
    AidItemsModule,
    PredictionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


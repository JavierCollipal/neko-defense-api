// 🐾⚡ DATABASE MODULE - MongoDB Connection Management ⚡🐾

import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // Make database service available everywhere!
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  constructor() {
    console.log('🐾 DATABASE MODULE LOADED - MongoDB connection management active, nyaa~! ⚡');
  }
}

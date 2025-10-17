// 🐾⚡ DATABASE SERVICE - Enhanced Connection Management ⚡🐾
// Handles MongoDB connection lifecycle with retry logic and health checks

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private retryAttempts = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds
  private connectionHealthCheckInterval: NodeJS.Timeout;

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.logger.log('🐾 Initializing MongoDB connection manager, nyaa~!');

    // Set up connection event handlers
    this.setupConnectionEventHandlers();

    // Start health check monitoring
    this.startHealthCheck();

    // Wait for initial connection
    await this.waitForConnection();
  }

  async onModuleDestroy() {
    this.logger.log('🐾 Shutting down MongoDB connection, desu~!');

    // Stop health check
    if (this.connectionHealthCheckInterval) {
      clearInterval(this.connectionHealthCheckInterval);
    }

    // Gracefully close connection
    await this.connection.close();
  }

  /**
   * 🔌 Set up MongoDB connection event handlers
   */
  private setupConnectionEventHandlers(): void {
    this.connection.on('connected', () => {
      this.logger.log('✅ MongoDB connected successfully!');
      this.retryAttempts = 0;
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
      this.handleDisconnection();
    });

    this.connection.on('error', (error) => {
      this.logger.error(`❌ MongoDB connection error: ${error.message}`, error.stack);
      this.handleConnectionError(error);
    });

    this.connection.on('reconnected', () => {
      this.logger.log('🔄 MongoDB reconnected successfully!');
      this.retryAttempts = 0;
    });

    this.connection.on('close', () => {
      this.logger.warn('🔒 MongoDB connection closed');
    });
  }

  /**
   * ⏳ Wait for MongoDB connection to be established
   */
  private async waitForConnection(timeout = 30000): Promise<void> {
    const startTime = Date.now();

    while (this.connection.readyState !== 1) {
      if (Date.now() - startTime > timeout) {
        throw new Error('MongoDB connection timeout after 30 seconds');
      }

      await this.sleep(100);
    }

    this.logger.log('✅ MongoDB connection established and ready, nyaa~!');
  }

  /**
   * 🔄 Handle disconnection with exponential backoff retry
   */
  private async handleDisconnection(): Promise<void> {
    if (this.retryAttempts >= this.maxRetries) {
      this.logger.error(
        `❌ Failed to reconnect to MongoDB after ${this.maxRetries} attempts. Exiting...`,
      );
      process.exit(1);
    }

    this.retryAttempts++;
    const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff

    this.logger.log(
      `🔄 Retry attempt ${this.retryAttempts}/${this.maxRetries} in ${delay}ms...`,
    );

    await this.sleep(delay);

    try {
      // Mongoose will automatically attempt to reconnect
      this.logger.log('🔌 Attempting to reconnect to MongoDB...');
    } catch (error) {
      this.logger.error(`❌ Reconnection attempt failed: ${error.message}`);
      await this.handleDisconnection();
    }
  }

  /**
   * 🚨 Handle connection errors
   */
  private handleConnectionError(error: Error): void {
    // Check for specific MongoDB errors
    if (error.message.includes('authentication failed')) {
      this.logger.error('🔒 MongoDB authentication failed! Check credentials in .env');
    } else if (error.message.includes('ECONNREFUSED')) {
      this.logger.error('🚫 MongoDB connection refused! Is the server running?');
    } else if (error.message.includes('timeout')) {
      this.logger.error('⏱️ MongoDB connection timeout! Check network and firewall settings');
    } else if (error.message.includes('SSL')) {
      this.logger.error('🔐 MongoDB SSL/TLS error! Check certificate configuration');
    }
  }

  /**
   * 🏥 Periodic health check
   */
  private startHealthCheck(): void {
    this.connectionHealthCheckInterval = setInterval(async () => {
      try {
        await this.checkHealth();
      } catch (error) {
        this.logger.warn(`⚠️ Health check failed: ${error.message}`);
      }
    }, 60000); // Check every minute
  }

  /**
   * 🩺 Check MongoDB connection health
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    readyState: number;
    ping: number;
    collections: number;
  }> {
    const startTime = Date.now();

    try {
      // Try to ping the database
      await this.connection.db.admin().ping();

      const ping = Date.now() - startTime;
      const collections = (await this.connection.db.listCollections().toArray()).length;

      return {
        status: 'healthy',
        readyState: this.connection.readyState,
        ping,
        collections,
      };
    } catch (error) {
      this.logger.error(`❌ Health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        readyState: this.connection.readyState,
        ping: -1,
        collections: 0,
      };
    }
  }

  /**
   * 📊 Get connection statistics
   */
  getConnectionStats(): {
    readyState: string;
    host: string;
    name: string;
    collections: string[];
  } {
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    return {
      readyState: readyStates[this.connection.readyState] || 'unknown',
      host: this.connection.host,
      name: this.connection.name,
      collections: Object.keys(this.connection.collections),
    };
  }

  /**
   * 💤 Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { ApiClientService } from './services/api-client.service';
import { StateManagerService } from './services/state-manager.service';
import { EventProcessorService } from './services/event-processor.service';
import { MapperService } from './services/mapper.service';
import { ExpressServer } from './server/express-server';

class Application {
  private apiClient: ApiClientService;
  private stateManager: StateManagerService;
  private mapperService: MapperService;
  private eventProcessor: EventProcessorService;
  private server: ExpressServer;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.apiClient = new ApiClientService();
    this.stateManager = new StateManagerService();
    this.mapperService = new MapperService();
    this.eventProcessor = new EventProcessorService(this.mapperService);
    this.server = new ExpressServer(this.stateManager);
  }

  async start(): Promise<void> {
    try {
      // start the express server
      await this.server.start();
      // start data polling
      this.startPolling();
      console.log('Application started successfully');
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private startPolling(): void {
    const poll = async () => {
      try {
        const syncedData = await this.apiClient.fetchSynchronizedData();
        const processedEvents = this.eventProcessor.processApiData(syncedData);
        this.stateManager.updateState(processedEvents);
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // initial fetch
    poll();

    // polling every 1000ms
    this.pollingInterval = setInterval(poll, 1000);
  }

  stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

// only start if run directly
if (require.main === module) {
  const app = new Application();
  app.start();

  // shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    app.stop();
    process.exit(0);
  });
}

export { Application };

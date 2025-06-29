import express from 'express';
import { StateManagerService } from '../services/state-manager.service';

export class ExpressServer {
  private app: express.Application;
  private port: number;
  private stateManager: StateManagerService;

  constructor(stateManager: StateManagerService) {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    this.stateManager = stateManager;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.get('/client/state', (req, res) => {
      try {
        // res.send('test');
        const clientState = this.stateManager.getClientState();
        res.json(clientState);
      } catch (error) {
        console.error('Error serving client state:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
        resolve();
      });
    });
  }
}

// Direct execution
// if (require.main === module) {
//     const stateManager = new StateManagerService();
//     const server = new ExpressServer(stateManager);
//     server.start();
// }

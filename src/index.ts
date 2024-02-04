import '@config';
import App from './app';
import { logger } from './utils/logger';

function handleOrQuit(app?: App) {
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection at:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception thrown:', error);
    process.exit(1);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (app) {
      app.server.close(() => {
        logger.error('Process terminated');
      });
    }
  });
}

const app = new App();

app
  .bootstrap()
  .then(() => {
    logger.info(
      `\n
##---------------------------------------------------------------## \n
           🟢 Application Ready To Handle Requests \n
##---------------------------------------------------------------##\n`
    );
    app.listen();
  })
  .catch((error) => {
    logger.error(`🔴 Bootstrapping Error: ${error}.`);
    process.exit(1);
  });

handleOrQuit(app);

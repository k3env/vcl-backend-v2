import * as express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/api';

export async function main(): Promise<void> {
  const app = express.default();

  app.use(express.json());
  app.use(cors({ origin: '*' }));
  app.use('/api', apiRouter);
  app.listen(3000, () => {
    console.log('it works');
  });
}

main();

import * as express from 'express';
import { v2Router } from './api/v2';
const apiRouter = express.Router();

apiRouter.use('/v1', (handler) => {
  const res = handler.res;
  res?.status(421).send({ message: 'v1 deprecated, use v2 instead' });
});
apiRouter.use('/v2', v2Router);
apiRouter.get('/', ({ res }) => {
  res?.send({ versions: ['v1', 'v2'] });
});

export { apiRouter };

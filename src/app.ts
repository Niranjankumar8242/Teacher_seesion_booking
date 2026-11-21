import express from 'express';
import { userRouter } from './routes/user.routes.js';
import { teacherRouter } from './routes/teacher.routes.js';
import { sessionRouter } from './routes/session.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/users', userRouter);
app.use('/teachers', teacherRouter);
app.use('/sessions', sessionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

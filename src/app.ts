import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './error/error.middleware';
import { notFoundHandler } from './error/not-found.middleware';
import { userRouter } from './users/users.router';
import { authRouter } from './auth/auth.router';
import { itemRouter } from './items/items.router';
import { cartRouter } from './carts/carts.router';
import { paymentRouter } from './payments/payments.router';
import { orderRouter } from './orders/orders.router';

export const app: Application = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
	res.status(200).send('Server is running');
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/carts', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/payments', paymentRouter);

app.use(errorHandler);
app.use(notFoundHandler);

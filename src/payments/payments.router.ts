/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import { deletePayment, getAllPayments, getUserPayments, MakePayment, updatePaymentStatus } from './payments.controller';

export const paymentRouter = Router();

paymentRouter.post('/', auth, MakePayment);

paymentRouter.put('/', auth, updatePaymentStatus);

paymentRouter.get('/', auth, getAllPayments);

paymentRouter.get('/user', auth, getUserPayments);

paymentRouter.delete('/', auth, deletePayment);
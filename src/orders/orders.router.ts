/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import {
	createOrder,
	getAllOrders,
	getMyOrders,
	updateOrderStatus,
} from './orders.controller';

export const orderRouter = Router();

orderRouter.post('/', auth, createOrder);

orderRouter.get('/admin', auth, getAllOrders);

orderRouter.get('/', auth, getMyOrders);

orderRouter.put('/:id', auth, updateOrderStatus);

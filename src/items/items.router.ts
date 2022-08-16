/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import {
	createItem,
	deleteItem,
	getAllItems,
	getItemById,
	toggleStockItem,
	updateItem,
} from './items.controller';

export const itemRouter = Router();

itemRouter.post('/', auth, createItem);

itemRouter.get('/', getAllItems);

itemRouter.get('/:id', getItemById);

itemRouter.put('/:id', auth, updateItem);

itemRouter.put('/:id/stock', auth, toggleStockItem);

itemRouter.delete('/:id', auth, deleteItem);

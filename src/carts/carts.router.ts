/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { auth } from '../auth/auth.middleware';
import {
	createCart,
	emptyCart,
	getCartById,
	getUserCart,
	updateCartItemByOne,
	removeCartItem,
} from './carts.controller';

export const cartRouter = Router();

cartRouter.post('/', auth, createCart);

cartRouter.get('/', auth, getUserCart);

cartRouter.get('/:id', auth, getCartById);

cartRouter.put('/:id/update', auth, updateCartItemByOne);

cartRouter.put('/:id/remove', auth, removeCartItem);

cartRouter.delete('/', auth, emptyCart);

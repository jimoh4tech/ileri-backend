/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Request, Response } from 'express';
import CartModel from '../carts/carts.model';
import { throwError } from '../users/users.utils';
import OrderModel from './orders.model';
import { parseOrderStatus, toNewOrder } from './orders.util';

export const createOrder = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (!user)
			return res.status(401).send('Authorization Exception. User not found.');
		const body = toNewOrder(req.body);
		const cart = await CartModel.findOne({ user: user.id });
		const items = cart.items;
		const order = await OrderModel.create({ ...body, user: user.id, items });

		//Empty user cart
		await CartModel.findOneAndUpdate(
			{ user: user.id },
			{ items: [] },
			{
				new: true,
				runValidators: true,
			}
		);
		return res.status(201).json(order);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getAllOrders = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (user.role !== 'admin')
			return res.status(403).send('Forbidden Exception. Only admin can access');
		const orders = await OrderModel.find({}).populate('items.itemId');
		return res.status(200).json(orders);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getMyOrders = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (!user) return res.status(401).send('Unauthorized exception');
		const order = await OrderModel.find({ user: user.id }).populate(
			'items.itemId'
		);
		return res.status(200).json(order);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const updateOrderStatus = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		const { id } = req.params;
		if (user.role !== 'admin')
			return res.status(403).send('Forbidden Exception. Only admin can access');
		const status = parseOrderStatus(req.body.status);
		const updatedAt = new Date();
		await OrderModel.findByIdAndUpdate(
			id,
			{ status, updatedAt },
			{ new: true, runValidators: true }
		);
		const orders = await OrderModel.find({}).populate('items.itemId');
		return res.status(200).json(orders);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

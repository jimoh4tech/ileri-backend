/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { Item, ItemCart } from '../items/items.interface';
import ItemModel from '../items/items.model';
import { User } from '../users/users.interface';
import { throwError } from '../users/users.utils';
import { Cart, CartItem, NewCart } from './carts.interface';
import CartModel from './carts.model';

export const createCart = async (req: Request, res: Response) => {
	try {
		const itemId: string = req.body.itemId;
		const quantity: number = req.body.quantity || 1;
		const item: CartItem = {
			itemId,
			quantity,
		};

		const user = req.currentUser;
		if (!user)
			return res
				.status(401)
				.send('Unauthorized exception. Only accessible authenticated users.');
		const existingCart: Cart = await CartModel.findOne({ user: user.id });

		if (!existingCart) {
			const cartObj: NewCart = {
				user: user.id as unknown as User,
				items: [item],
			};
			await CartModel.create(cartObj);
			const cart: Cart = await CartModel.findOne({ user: user.id });
			return res.status(201).json(cart);
		}

		const curItems = existingCart.items.map((it) => it.itemId + '');
		const checkItem: string = item.itemId;
		if (curItems.includes(checkItem)) {
			await CartModel.findOneAndUpdate(
				{
					user: user.id,
					items: { $elemMatch: { itemId: item.itemId } },
				},
				{
					$inc: { 'items.$.quantity': item.quantity },
				}
			);
			const updatedCart = await CartModel.findById(existingCart.id);
			return res.status(200).json(updatedCart);
		}
		const itemsToUpdate = {
			items: existingCart.items.concat(item),
		};
		const updatedCart = await CartModel.findByIdAndUpdate(
			existingCart.id,
			itemsToUpdate,
			{
				new: true,
				runValidators: true,
			}
		);

		return res.status(200).json(updatedCart);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getUserCart = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;

		if (!user) return res.status(401).send('Unauthorized to access this route');

		const cart = await CartModel.findOne({
			user: user.id,
		}).populate('items.itemId');

		const cartObj: ItemCart[] = cart.items.map((it) => {
			const item = it.itemId as unknown as Item;
			return {
				id: item.id,
				name: item.name,
				category: item.category,
				quantity: it.quantity,
				imageUrl: item.imageUrl,
				price: item.price,
				stocked: item.stocked,
				deliveryValue: item.deliveryValue,
			};
		});
		if (cart) return res.status(200).json(cartObj);

		return res.status(404).send('Not Found. No Cart associated with this user');
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const updateCartItemByOne = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;

		if (!user) return res.status(401).send('Unauthorized to access this route');
		const { id } = req.params;
		const { value } = req.query;
		const item = await ItemModel.findById(id);
		if (!item) return res.status(404).send(`Item with id: ${id} not found`);
		const cart = await CartModel.findOne({ user: user.id });
		if (!cart) return res.status(400).send('User cart is empty');

		const cartItems = cart.items.map((it) => it.itemId + '');
		if (cartItems.includes(id)) {
			await CartModel.findOneAndUpdate(
				{
					user: user.id,
					items: { $elemMatch: { itemId: item.id } },
				},
				{
					$inc: { 'items.$.quantity': value },
				}
			);
		}
		const updatedCart = await CartModel.findById(cart.id).populate(
			'items.itemId'
		);
		const cartObj: ItemCart[] = updatedCart.items.map((it) => {
			const item = it.itemId as unknown as Item;
			return {
				id: item.id,
				name: item.name,
				category: item.category,
				quantity: it.quantity,
				imageUrl: item.imageUrl,
				price: item.price,
				stocked: item.stocked,
				deliveryValue: item.deliveryValue,
			};
		});
		return res.status(200).json(cartObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getCartById = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		const { id } = req.params;

		if (!user) return res.status(401).send('Unauthorized to access this route');

		const cart: Cart | null = await CartModel.findById(id);
		if (cart) return res.status(200).json(cart);

		return res.status(404).send('Not Found. No Cart associated with this user');
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const removeCartItem = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		const { id } = req.params;

		if (!user) return res.status(401).send('Unauthorized to access this route');

		const cart: Cart | null = await CartModel.findOne({ user: user.id });

		if (!cart) return res.status(404).send(`Not found. User cart is empty`);

		const itemsToUpdate = cart.items.filter((it) => it.itemId + '' !== id);

		await CartModel.findByIdAndUpdate(
			cart.id,
			{ items: itemsToUpdate },
			{
				new: true,
				runValidators: true,
			}
		);
		const updatedCart = await CartModel.findById(cart.id).populate(
			'items.itemId'
		);
		const cartObj: ItemCart[] = updatedCart.items.map((it) => {
			const item = it.itemId as unknown as Item;
			return {
				id: item.id,
				name: item.name,
				category: item.category,
				quantity: it.quantity,
				imageUrl: item.imageUrl,
				price: item.price,
				stocked: item.stocked,
				deliveryValue: item.deliveryValue,
			};
		});
		return res.status(200).json(cartObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const emptyCart = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;

		if (!user) return res.status(401).send('Unauthorized to access this route');
		const cart: Cart | null = await CartModel.findOne({ user: user.id });

		if (!cart)
			return res.status(404).send(`Not found. Not cart associated with user`);

		const itemsToUpdate = {
			items: [],
		};

		await CartModel.findOneAndUpdate({ user: user.id }, itemsToUpdate, {
			new: true,
			runValidators: true,
		});
		return res.status(204).end();
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

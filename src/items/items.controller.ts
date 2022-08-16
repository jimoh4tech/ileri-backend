import { Request, Response } from 'express';
import { User } from '../users/users.interface';
import { throwError } from '../users/users.utils';
import { Item, Items, NewItem } from './items.interface';
import ItemModel from './items.model';
import { toNewItem, toUpdateItem } from './items.util';

export const createItem = async (req: Request, res: Response) => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const item: NewItem = toNewItem(req.body);
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`);

		const itemExist: Item | null = await ItemModel.findOne({ name: item.name });

		if (itemExist)
			return res
				.status(403)
				.send('Item name already existed. Items must have unique name');

		await ItemModel.create(item);
		const items = await ItemModel.find({});
		return res.status(201).json(items);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getAllItems = async (_req: Request, res: Response) => {
	try {
		const items: Items = await ItemModel.find({});
		res.status(200).json(items);
	} catch (error: unknown) {
		res.status(400).send(throwError(error));
	}
};

export const getItemById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const item: Item | null = await ItemModel.findById(id);

		if (item) res.status(200).json(item);

		res.status(404).send(`Item with id: ${id} not found!`);
	} catch (error: unknown) {
		res.status(400).send(throwError(error));
	}
};

export const updateItem = async (req: Request, res: Response) => {
	try {
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`)
				.end();
		const { id } = req.params;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		const itemToUpdate = toUpdateItem(req.body);
		await ItemModel.findByIdAndUpdate(id, itemToUpdate, {
			new: true,
			runValidators: true,
		});

		const items = await ItemModel.find({});
		return res.status(200).json(items);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const toggleStockItem = async (req: Request, res: Response) => {
	try {
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`)
				.end();
		const { id } = req.params;
		const item = await ItemModel.findById(id);

		await ItemModel.findByIdAndUpdate(
			id,
			{ stocked: !item.stocked },
			{
				new: true,
				runValidators: true,
			}
		);

		const items = await ItemModel.find({});
		return res.status(200).json(items);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const deleteItem = async (req: Request, res: Response) => {
	try {
		const user: User = req.currentUser;
		const { id } = req.params;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`)
				.end();
		await ItemModel.findByIdAndDelete(id);
		const items = await ItemModel.find({});
		return res.status(204).json(items);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { User, Users } from './users.interface';
import UserModel from './users.model';
import { parseName, parsePhone, parseRole, throwError } from './users.utils';

export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`);
		const users: Users = await UserModel.find({});
		return res.status(200).json(users);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user: User | null = await UserModel.findById(id);
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`);

		if (user) return res.status(200).json(user);

		return res.status(404).send(`User with id: ${id} not found`);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const updateUserInfo = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (!user) return res.status(401).send('Authentication Exception');

		const { id } = req.params;
		const name = parseName(req.body.name);
		const phone = parsePhone(req.body.phone);
		

		const updatedUser = await UserModel.findByIdAndUpdate(
			id,
			{ name, phone },
			{ new: true, runValidators: true }
		);
		const userObj = {
			name: updatedUser.name,
			phone: updatedUser.phone,
		};
		return res.status(200).json(userObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`)
				.end();
		const { name, phone, role } = req.body;

		const userToUpdate = {
			name: parseName(name),
			role: parseRole(role),
			phone: parsePhone(phone),
		};

		await UserModel.findByIdAndUpdate(id, userToUpdate, {
			new: true,
			runValidators: true,
		});
		const users = await UserModel.find({});
		return res.status(200).json(users);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user: User = req.currentUser;
		if (user.role !== 'admin')
			return res
				.status(403)
				.send(`Forbidden Exception. Only Admin can acces this route`)
				.end();
		await UserModel.findByIdAndDelete(id);
		const users = await UserModel.find({});
		return res.status(204).json(users);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import * as argon from 'argon2';

import { parseEmail, parsePassword, throwError, toNewUser } from '../users/users.utils';
import UserModel from '../users/users.model';
import { NewUser, User } from '../users/users.interface';
import CartModel from '../carts/carts.model';

export const register = async (req: Request, res: Response) => {
	try {
		const newUser: NewUser = toNewUser(req.body);

		const userExist: User | null = await UserModel.findOne({
			email: newUser.email,
		});
		if (userExist)
			return res.status(403).json({
				error: 'Email must be unique. User already registered',
			});
		const hash = await argon.hash(newUser.password);
		newUser.password = hash;

		const createdUser: User = await UserModel.create(newUser);

		const userForToken = {
			email: createdUser.email,
			id: createdUser.id,
		};
		const secret: string = process.env.SECRET || 'test-environent';

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const token = sign(userForToken, secret, { expiresIn: '1h' });
		const userObj = {
			id: createdUser.id,
			email: createdUser.email,
			name: createdUser.name,
			phone: createdUser.phone,
			createdAt: createdUser.createdAt,
			role: createdUser.role,
			token,
		};

		return res.status(201).json(userObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const email: string = parseEmail(req.body.email).toLowerCase();
		const password = parsePassword(req.body.password);
		const user = await UserModel.findOne({ email });

		const passwordCorrect =
			user === null ? false : await argon.verify(user.password, password);
		if (!user || !passwordCorrect) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		const userForToken = {
			email: user?.email,
			id: user?.id,
		};
		const secret: string = process.env.SECRET || 'test-environent';

		const userCart = await CartModel.findOne({ user: user?.id });
		const cart = userCart?.items.length || 0;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const token = sign(userForToken, secret, { expiresIn: '1h' });
		const userObj = {
			id: user.id,
			email: user.email,
			name: user.name,
			phone: user.phone,
			createdAt: user.createdAt,
			role: user.role,
			token,
			cart,
		};

		return res.status(200).json(userObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const changePassword = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		if (!user) return res.status(401).send('Authorization Exception');

		const { id } = req.params;
		const newPassword = parsePassword(req.body.newPassword);
		const currentPassword = parsePassword(req.body.currentPassword);
		const passwordMatch = await argon.verify(user.password, currentPassword);

		if (!passwordMatch)
			return res.status(400).send('Current password does not correspond');
		const password = await argon.hash(newPassword);
		await UserModel.findByIdAndUpdate(
			id,
			{ password },
			{ new: true, runValidators: true }
		);

		const userForToken = {
			email: user?.email,
			id: user?.id,
		};
		const secret: string = process.env.SECRET || 'test-environent';

		const userCart = await CartModel.findOne({ user: user?.id });
		const cart = userCart?.items.length || 0;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		const token = sign(userForToken, secret, { expiresIn: '1h' });
		const userObj = {
			id: user.id,
			email: user.email,
			name: user.name,
			phone: user.phone,
			createdAt: user.createdAt,
			role: user.role,
			token,
			cart,
		};

		return res.status(200).json(userObj);
	} catch (error: unknown) {
		return res.status(400).send(throwError(error));
	}
};

export const resetPassword = async (req: Request, res: Response) => {
	try {
		const user = req.currentUser;
		let password = parsePassword(req.body.password);
		password = await argon.hash(password);

		const updatedUser = await UserModel.findByIdAndUpdate(
			user.id,
			{ password },
			{
				new: true,
				runValidators: true,
			}
		);

		res.status(200).json(updatedUser);
	} catch (error: unknown) {
		res.status(400).send(throwError(error));
	}
};

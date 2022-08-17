/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from 'express';
import { User } from '../users/users.interface';
import UserModel from '../users/users.model';
import { getDecodedToken } from './auth.util';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (!req.headers.authorization)
			return res.status(403).send('Forbidden Exception. Token must be provided');
		const decodedToken = getDecodedToken(String(req.headers.authorization));
		const user: User | null = await UserModel.findById(decodedToken.id);
		req.currentUser = user;
		return next();
	} catch (error: unknown) {
		return next(error);
	}
};


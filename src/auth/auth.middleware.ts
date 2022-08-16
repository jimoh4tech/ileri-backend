/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NextFunction, Request, Response } from 'express';
import { User } from '../users/users.interface';
import UserModel from '../users/users.model';
import { getDecodedToken } from './auth.util';

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const decodedToken = getDecodedToken(String(req.headers.authorization));
		const user: User | null = await UserModel.findById(decodedToken.id);
		req.currentUser = user;
		next();
	} catch (error: unknown) {
		next(error);
	}
};


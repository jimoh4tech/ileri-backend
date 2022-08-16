/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';

import {
	changePassword,
	login,
	register,
	resetPassword,
} from './auth.controller';
import { auth } from './auth.middleware';

export const authRouter = Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.put('/:id', auth, changePassword);

authRouter.put('/', auth, resetPassword);

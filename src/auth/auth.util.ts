import { verify } from 'jsonwebtoken';
import { Token } from '../users/users.interface';

export const getDecodedToken = (auth: string): Token => {
	let token = '';
	if (auth && auth.toLowerCase().startsWith('bearer ')) {
		token = auth.substring(7);
	}
	const secret: string = process.env.SECRET || 'test-environent';
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	const decodedToken = verify(token, secret) as Token;

	if (!decodedToken) throw new Error('Invalid or missing token');

	return decodedToken;
};



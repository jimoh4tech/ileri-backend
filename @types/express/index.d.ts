import { User } from '../../src/users/users.interface';

declare global {
	namespace Express {
		interface Request {
			currentUser: User | null;
		}
	}
}

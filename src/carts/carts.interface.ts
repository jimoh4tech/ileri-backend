import { User } from '../users/users.interface';

export interface CartItem {
	itemId: string;
	quantity: number;
}
export interface Cart {
	id: string;
	items: CartItem[];
	user: User;
	createdAt?: Date;
	updatedAt?: Date;
}

export type NewCart = Omit<Cart, 'id'>;

export enum Category {
	Block = 'block',
	Sand = 'sand',
	others = 'others',
	Cement = 'cement',
}

export interface Item {
	id: string;
	name: string;
	category: Category;
	imageUrl: string;
	price: number;
	discount: number;
	description?: string;
	stocked: boolean;
	reviews: ItemReview;
	deliveryValue: number;
	createdAt?: Date;
	updatedAt?: Date;
}
export interface ItemCart extends Omit<Item, 'discount' | 'reviews'>{
	quantity?: number;
}

export interface ItemReview {
	rating: number;
	numReviews: number;
}

export type NewItem = Omit<Item, 'id'>;

export type Items = Item[];

export interface ItemFields {
	name: unknown;
	category: unknown;
	imageUrl: unknown;
	price: unknown;
	deliveryValue: unknown;
}

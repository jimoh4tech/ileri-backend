import { isString } from '../users/users.utils';
import { Category, ItemFields, NewItem } from './items.interface';

export const isNumber = (text: unknown): text is number => {
	return typeof text === 'number' || text instanceof Number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isCategory = (param: any): param is Category => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return Object.values(Category).includes(param);
};

const parseName = (name: unknown): string => {
	if (!name || !isString(name)) {
		throw new Error('Incorrect or missing item name ' + name);
	}
	return name;
};

const parsePrice = (price: unknown): number => {
	if (!price || !isNumber(price))
		throw new Error('Incorrect or missing item price ' + price);
	return price;
};

const parseImageUrl = (image: unknown): string => {
	if (!image || !isString(image))
		throw new Error('Incorrect or missing item image URL ' + image);
	return image;
};

const parseDeliveryValue = (value: unknown): number => {
	if (!value || !isNumber(value) || ![1, 2, 3, 4].includes(value))
		throw new Error('Incorrect or missing delivery value ' + value);
	return value;
};

const parseCategory = (category: unknown): Category => {
	if (!category || !isCategory(category))
		throw new Error('Incorrect or missing item category ' + category);
	return category;
};

export const toNewItem = ({
	name,
	price,
	category,
	imageUrl,
	deliveryValue,
}: ItemFields): NewItem => {
	const discount = Number(Math.random().toFixed(2));
	const rating = 3 + Number(Math.random().toFixed(2)) * 2;
	const numReviews = 5 + Math.trunc(Math.random() * 10);
	return {
		name: parseName(name),
		price: parsePrice(Number(price)),
		discount,
		category: parseCategory(category),
		imageUrl: parseImageUrl(imageUrl),
		createdAt: new Date(),
		updatedAt: new Date(),
		stocked: true,
		reviews: { rating, numReviews },
		deliveryValue: parseDeliveryValue(deliveryValue),
	};
};

export const toUpdateItem = ({
	name,
	category,
	price,
	imageUrl,
}: {
	name: unknown;
	imageUrl: unknown;
	price: unknown;
	category: unknown;
}) => {
	return {
		name: parseName(name),
		category: parseCategory(category),
		price: parsePrice(Number(price)),
		imageUrl: parseImageUrl(imageUrl),
		updatedAt: new Date(),
	};
};

import { isNumber } from '../items/items.util';

export const parseAmount = (amount: unknown): number => {
	if (!amount || !isNumber(amount))
		throw new Error('Incorrect or missing amount ' + amount);
	return amount;
};



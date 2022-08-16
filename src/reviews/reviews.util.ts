import { isNumber } from '../items/items.util';
import { isString } from '../users/users.utils';

export const parseComment = (comment: unknown): string => {
	if (!comment || !isString(comment))
		throw new Error('Incorrect or missing comment');
	return comment;
};

export const parseRating = (rating: unknown): number => {
	if (!rating || !isNumber(rating))
		throw new Error('Incorrect or missing rating');

	if (rating < 1 || rating > 5)
		throw new Error('Incorrect rating value (1 - 5)');
	return rating;
};

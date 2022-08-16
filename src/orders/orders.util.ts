import { isNumber } from '../items/items.util';
import { isString, parseName, parsePhone } from '../users/users.utils';
import { NewOrder, OrderFields, OrderStatus } from './orders.interface';

export const parseAddress = (address: unknown): string => {
	if (!address || !isString(address))
		throw new Error('Incorrect or missing address ' + address);
	return address;
};

export const parsePaymentRef = (payment: unknown): string => {
	if (!payment || !isString(payment))
		throw new Error('Incorrect or missing payment reference ' + payment);
	return payment;
};

export const parseTotal = (total: unknown): number => {
	if (!total || !isNumber(total) || total < 0)
		throw new Error('Incorrect or missing total ' + total);
	return total;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseOrderStatus = (status: any): OrderStatus => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	if (!status || !Object.values(OrderStatus).includes(status))
		throw new Error('Incorrect or missing order status');
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return status;
};

export const parseCity = (city: unknown): string => {
	if (!city || !isString(city))
		throw new Error('Incorrect or missing city ' + city);
	return city;
};

export const parseType = (type: unknown): string => {
	if (!type || !isString(type) || !['standard', 'pickup'].includes(type))
		throw new Error('Incorrect or missing type ' + type);
	return type;
};

export const toNewOrder = ({
	name,
	address,
	city,
	phone,
	type,
	total,
	items,
	user,
	paymentRef
}: OrderFields): NewOrder => {
	return {
		name: parseName(name),
		address: parseAddress(address),
		city: parseCity(city),
		phone: parsePhone(phone),
		type: parseType(type),
		total: parseTotal(total),
		status: OrderStatus.Confirmed,
		paymentRef: parsePaymentRef(paymentRef),
		items,
		user
	};
};

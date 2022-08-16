/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NewUser, Role, UserFields } from './users.interface';

export const isString = (text: unknown): text is string => {
	return typeof text === 'string' || text instanceof String;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseRole = (role: any): Role => {
	if (!role || !Object.values(Role).includes(role)) {
		throw new Error('Incorrect or missing role ' + role);
	}
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return role;
};

export const parseName = (name: unknown): string => {
	if (!name || !isString(name)) {
		throw new Error('Incorrect or missing name ' + name);
	}

	if (name.length < 5) {
		throw new Error('Name must be at least 5 characters');
	}
	return name;
};

export const parseAddress = (address: unknown): string => {
	if (!address || !isString(address))
		throw new Error('Incorrect or misssing address ' + address);
	return address;
};

export const parsePhone = (phone: unknown): string => {
	if (!phone || !isString(phone)) {
		throw new Error('Incorrect or missing phone ' + phone);
	}

	if (phone.length < 11) {
		throw new Error('Phone number must be at least 5 characters');
	}
	return phone;
};
export const parseEmail = (email: unknown): string => {
	const regex =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!email || !isString(email) || !regex.test(email)) {
		throw new Error('Missing or invalid email ' + email);
	}
	return email;
};

export const parsePassword = (password: unknown): string => {
	if (!password || !isString(password)) {
		throw new Error('Incorrect or missing password ' + password);
	}
	if (password.length < 6) {
		throw new Error('Password must be at least 6 characters');
	}
	return password;
};

export const toNewUser = ({
	name,
	phone,
	password,
	role,
	email,
}: UserFields): NewUser => {
	if (process.env.NODE_ENV === 'test')
		return {
			name: parseName(name),
			password: parsePassword(password),
			phone: parsePhone(phone),
			role: parseRole(role),
			email: parseEmail(email).toLowerCase(),
		};
	return {
		name: parseName(name),
		password: parsePassword(password),
		phone: parsePhone(phone),
		role: Role.User,
		email: parseEmail(email).toLowerCase(),
	};
};

export const throwError = (error: unknown) => {
	let errorMessage = 'Something went wrong. ';
	if (error instanceof Error) {
		errorMessage += 'Error: ' + error.message;
	}
	return errorMessage;
};

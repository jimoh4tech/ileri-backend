export enum Role {
	User = 'user',
	Admin = 'admin',
}

export interface User {
	id: string;
	name: string;
	phone: string;
	password: string;
  email: string;
	role: Role;
	address?: string;
  createdAt?: Date;
}

export type NewUser = Omit<User, 'id'>;



export type Users = User[];

export interface UserFields {
	name: unknown;
	phone: unknown;
	email: unknown;
	password: unknown;
	role?: unknown;
	address?: unknown;
}

export interface Token {
	phone: string;
	id: string;
}
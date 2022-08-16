import { CartItem } from "../carts/carts.interface";
import { User } from "../users/users.interface";

export enum OrderStatus {
  Confirmed = 'confirmed',
  Delivered = 'delivered',
  Shipped = 'shipped'
}

export interface Order {
  id: string;
  user: User;
  address: string;
  phone: string;
  name: string;
  city: string;
  type: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  paymentRef: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderFields {
	user: User;
	address: unknown;
	phone: unknown;
	name: unknown;
	city: unknown;
  type: unknown;
	items: CartItem[];
	total: unknown;
  paymentRef: unknown;
}
export type NewOrder = Omit<Order, 'id'>;
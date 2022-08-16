import { User } from "../users/users.interface";

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Refunded = 'refunded'
}


export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  user: User;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NewPayment = Omit<Payment, 'id'>;
